import { WithdrawalRequest } from "../model/withdrawRequest.js";
import { User } from "../model/userModel.js";
import { Transaction } from "../model/transactionModel.js";
import { Tournament } from "../model/tournamentModel.js";
import { Op } from "sequelize";
import { sequelize } from "../config/database.js";
import cron from "node-cron";
// controllers/adminController.js
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Admin } from "../model/adminModel.js";

//Superadmin create subadmin
const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, role, status, permissions } = req.body;

    // Validate fields
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled." });
    }
    if (!Array.isArray(permissions)) {
      return res.status(400).json({ message: "Permissions must be an array" });
    }

    const existing = await Admin.findOne({ where: { email } });
    if (existing)
      return res.status(409).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: role || "subadmin",
      status: status || "active",
      permissions: Array.isArray(permissions) ? permissions : [],
    });

    res.status(201).json({
      message: "Admin registered successfully",
      admin: {
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        status: newAdmin.status,
        permissions: newAdmin.permissions,
      },
    });
  } catch (error) {
    console.error("Admin registration error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
//login for both superadmin and subadmin
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });

    const admin = await Admin.findOne({ where: { email } });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    if (admin.status !== "active") {
      return res
        .status(403)
        .json({ message: "Account is inactive. Contact superadmin." });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_SECRET || "defaultsecretkey",
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        status: admin.status,
        permissions: admin.permissions,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// Update Subadmin
const updateSubadmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, status, permissions } = req.body;

    const subadmin = await Admin.findByPk(id);
    if (!subadmin || subadmin.role !== "subadmin") {
      return res.status(404).json({ message: "Subadmin not found" });
    }

    subadmin.name = name || subadmin.name;
    subadmin.email = email || subadmin.email;
    subadmin.status = status || subadmin.status;
    subadmin.permissions = permissions || subadmin.permissions;

    await subadmin.save();

    res
      .status(200)
      .json({ message: "Subadmin updated successfully", subadmin });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete Subadmin
const deleteSubadmin = async (req, res) => {
  try {
    const { id } = req.params;

    const subadmin = await Admin.findByPk(id);
    if (!subadmin || subadmin.role !== "subadmin") {
      return res.status(404).json({ message: "Subadmin not found" });
    }

    await subadmin.destroy();

    res.status(200).json({ message: "Subadmin deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get All Subadmins with Pagination and Search
const getAllSubadmins = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows: subadmins } = await Admin.findAndCountAll({
      where: {
        role: "subadmin",
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
        ],
      },
      offset: parseInt(offset),
      limit: parseInt(limit),
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      totalSubadmins: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      subadmins,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch subadmins", error: error.message });
  }
};

//Gey All Users
const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "createdAt",
      order = "DESC",
    } = req.query;

    const offset = (page - 1) * limit;

    const whereClause = {
      [Op.or]: [
        { username: { [Op.iLike]: `%${search}%` } },
        { mobile: { [Op.iLike]: `%${search}%` } },
      ],
    };

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, order]],
    });

    return res.status(200).json({
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      users: rows,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

//Get specific user detail
const getUserDetails = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user); // full user object
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

//Ban OR Unoban User
const banOrUnbanUser = async (req, res) => {
  try {
    const { mobile, action } = req.body;

    // Validation
    if (!mobile || !["ban", "unban"].includes(action)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid request. 'mobile' and 'action' ('ban' or 'unban') are required.",
      });
    }

    const user = await User.findOne({ where: { mobile } });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Update status
    user.status = action === "ban" ? "Banned" : "Active";
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User has been ${action === "ban" ? "banned" : "unbanned"}.`,
      user: {
        id: user.id,
        username: user.username,
        mobile: user.mobile,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Ban/Unban Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating user status.",
    });
  }
};
// 1. Withdrawal Request Approve/Reject
const handleWithdrawalRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    const request = await WithdrawalRequest.findByPk(requestId);
    if (!request) {
      return res.status(404).json({ message: "Withdrawal request not found" });
    }

    if (status === "approved") {
      request.status = "approved";
      // Payment API ya manual payout yahan trigger kar sakte ho
    } else if (status === "rejected") {
      request.status = "rejected";
      // Agar reject kiya to user ka wallet refund kar sakte ho
      const user = await User.findByPk(request.userId);
      user.walletBalance += request.amount;
      await user.save();
    } else {
      return res.status(400).json({ message: "Invalid status" });
    }

    await request.save();
    res.status(200).json({ message: `Withdrawal ${status} successfully.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// 2. Manual Payout
const manualPayout = async (req, res) => {
  try {
    const { userId, amount, note } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Manual payout logic, jaise wallet balance se minus karna
    if (user.walletBalance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    user.walletBalance -= amount;
    await user.save();

    await Transaction.create({
      userId,
      type: "manual_payout",
      amount,
      status: "completed",
      note: note || "Manual payout by admin",
    });

    res.status(200).json({ message: "Manual payout successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// 3. Transactions Monitoring
const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json({ transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// 4. Bonus Manage
const giveBonus = async (req, res) => {
  try {
    const { userId, bonusAmount } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.walletBalance += bonusAmount;
    await user.save();

    await Transaction.create({
      userId,
      type: "bonus",
      amount: bonusAmount,
      status: "completed",
      note: "Bonus credited by admin",
    });

    res.status(200).json({ message: "Bonus credited successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export {
  registerAdmin,
  loginAdmin,
  updateSubadmin,
  deleteSubadmin,
  getAllSubadmins,
  getAllUsers,
  getUserDetails,
  handleWithdrawalRequest,
  manualPayout,
  getAllTransactions,
  giveBonus,
  banOrUnbanUser,
};
