import { WithdrawalRequest } from "../model/withdrawRequest.js";
import { User } from "../model/userModel.js";
import { Transaction } from "../model/transactionModel.js";
import { Op } from "sequelize";
import { sequelize } from "../config/database.js";
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

export { handleWithdrawalRequest, manualPayout, getAllTransactions, giveBonus };
