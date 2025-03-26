import { User } from "../model/user.model.js"; // User model import
import { Wallet } from "../model/wallet.model.js";
import { Transaction } from "../model/transaction.js";
import { Otp } from "../model/otp.model.js";
import otpgenerator from "otp-generator";
import twilio from "twilio";
import dotenv from "dotenv"; // dotenv for environment variables
import { sequelize } from "../DB/db.user.js";
import { UPSERT } from "sequelize/lib/query-types";
// Load environment variables
dotenv.config();

const accountId = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = new twilio(accountId, authToken);

// Helper function to generate access and refresh tokens
const generateAccessTokenandRefreshToken = async (userId) => {
  try {
    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return { message: "User not found" };
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    console.log("Generated Refresh Token:", refreshToken);
    await user.save();

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error generating tokens:", error.message);
    throw new Error("Something went wrong while generating tokens");
  }
};

// Function to handle OTP generation and sending
const sendOTP = async (req, res) => {
  try {
    const { mobileNo } = req.body;

    // Generate OTP
    const otp = otpgenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });

    const expire_at = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

    // Find existing user
    let user = await User.findOne({ where: { mobileNo } });

    if (user) {
      // Update OTP for existing user
      await user.update({ otp, expire_at });
    } else {
      // Create new user if not exists
      user = await User.create({ mobileNo, otp, expire_at });
    }

    // Send OTP via Twilio
    await twilioClient.messages.create({
      body: `Your OTP is: ${otp}`,
      to: mobileNo,
      from: process.env.TWILIO_PHONE_NUMBER,
    });

    return res.status(200).json({
      success: true,
      msg: "OTP sent successfully",
      otp, // ⚠️ Remove this in production
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};
const verifyOTP = async (req, res) => {
  try {
    const { mobileNo, otp } = req.body;

    // Check if user exists
    const user = await User.findOne({ where: { mobileNo } });

    if (!user) {
      return res.status(400).json({
        success: false,
        msg: "User not found",
      });
    }

    // Check if OTP matches
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        msg: "Invalid OTP",
      });
    }

    // Check if OTP has expired
    if (new Date() > user.expire_at) {
      return res.status(400).json({
        success: false,
        msg: "OTP has expired",
      });
    }

    // OTP verification successful, clear OTP and expiration time
    await user.update({ otp: null, expire_at: null });

    return res.status(200).json({
      success: true,
      msg: "OTP verified successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

const createWallet = async (userId) => {
  try {
    if (!userId || isNaN(userId)) {
      throw new Error(`Invalid userId: ${userId}`); // ✅ Validate userId before proceeding
    }

    // ✅ Check if wallet already exists
    let wallet = await Wallet.findOne({ where: { userId } });

    if (wallet) {
      console.log(`ℹ️ Wallet already exists for user ${userId}`);
      return wallet; // ✅ Return existing wallet
    }

    console.log(`ℹ️ Creating wallet for userId:`, userId); // ✅ Debugging step

    // ✅ Create a new wallet
    wallet = await Wallet.create({
      userId: Number(userId), // ✅ Ensure userId is a number
      balance: 0,
      bonusBalance: 0,
      winningBalance: 0,
    });

    console.log(`✅ Wallet created successfully for user ${userId}`);
    return wallet;
  } catch (error) {
    console.error("❌ Error creating wallet:", error.message);
    throw new Error("Failed to create wallet");
  }
};
const createw = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const wallet = await createWallet(userId);
    res.json({ message: "Wallet created successfully", wallet });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// User registration function
const Register = async (req, res) => {
  /*try {
    const { mobileNo, otp } = req.body;

    if ([mobileNo, otp].some((field) => field?.trim() === "")) {
      return res
        .status(500)
        .json({ message: "Mobile number and OTP are required" });
    }

    const regex = /^\d{10}$/;
    if (!regex.test(mobileNo)) {
      return res.status(400).json({
        message:
          "Mobile number should be exactly 10 digits and contain only numbers.",
      });
    }

    // Verify OTP using Firebase
    try {
      await verifyOTP(mobileNo, otp); // Firebase OTP verification
    } catch (otpError) {
      return res.status(400).json({ message: otpError.message });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ where: { mobileNo } });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this mobile number already exists" });
    }

    // Create new user after OTP verification
    const newUser = await User.create({ mobileNo });
    await createWallet(newUser.id);
    // Generate access and refresh tokens for the new user
    const { accessToken, refreshToken } =
      await generateAccessTokenandRefreshToken(newUser.id);

    return res.status(201).json({
      message: "User registration successful",
      user: newUser,
      accessToken,
      refreshToken,
    });*/
  try {
    const { mobileNo } = req.body;

    if ([mobileNo].some((field) => field?.trim() === "")) {
      return res
        .status(500)
        .json({ message: "Mobile number and OTP are required" });
    }

    const regex = /^\d{10}$/;
    if (!regex.test(mobileNo)) {
      return res.status(400).json({
        message:
          "Mobile number should be exactly 10 digits and contain only numbers.",
      });
    }

    // Verify OTP using Firebase
    /* try {
       await verifyOTP(mobileNo, otp); // Firebase OTP verification
     } catch (otpError) {
       return res.status(400).json({ message: otpError.message });
     }*/

    // Check if the user already exists
    const existingUser = await User.findOne({ where: { mobileNo } });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this mobile number already exists" });
    }

    // Create new user after OTP verification
    const newUser = await User.create({ mobileNo });
    await createWallet(newUser.id);
    // Generate access and refresh tokens for the new user
    const { accessToken, refreshToken } =
      await generateAccessTokenandRefreshToken(newUser.id);

    return res.status(201).json({
      message: "User registration successful",
      user: newUser,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getWalletBalance = async (req, res) => {
  const { userId } = req.params; // ✅ Get userId from URL

  if (!userId || isNaN(userId)) {
    return res.status(400).json({ error: "Invalid userId. Must be a number." });
  }

  try {
    const wallet = await Wallet.findOne({ where: { userId } });

    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found for this user." });
    }

    res.json({
      userId: wallet.userId,
      balance: wallet.balance,
      bonusBalance: wallet.bonusBalance,
      winningBalance: wallet.winningBalance,
      currency: wallet.currency,
    });
  } catch (error) {
    console.error("❌ Error fetching wallet balance:", error.message);
    res.status(500).json({ error: "Failed to retrieve balance" });
  }
};

// ✅ Deposit Money (via Razorpay or Manual)
const depositMoney = async (req, res) => {
  let { userId, balance } = req.body;

  // ✅ Convert values to numbers
  userId = Number(userId);
  balance = Number(balance);

  if (!userId || isNaN(balance) || balance <= 0) {
    return res.status(400).json({ error: "Invalid deposit request" });
  }

  try {
    await sequelize.transaction(async (t) => {
      // ✅ Check if the wallet exists
      let wallet = await Wallet.findOne({ where: { userId }, transaction: t });

      if (!wallet) {
        console.log(`Wallet not found for user ${userId}. Creating one...`);
        wallet = await Wallet.create(
          { userId, balance: 0, bonusBalance: 0, winningBalance: 0 },
          { transaction: t }
        );
      }

      console.log("✅ Existing Wallet Data:", wallet.dataValues);

      // ✅ Update only the balance
      const updatedBalance = Number(wallet.balance) + balance;

      await wallet.update({ balance: updatedBalance }, { transaction: t });

      console.log("✅ Updated Wallet Data:", wallet.dataValues);

      // ✅ Save transaction record
      await Transaction.create(
        { userId, amount: balance, type: "deposit", status: "completed" },
        { transaction: t }
      );

      return res.status(200).json({
        message: "Deposit successful",
        newBalance: updatedBalance,
      });
    });
  } catch (error) {
    console.error("Transaction failed:", error);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Deposit failed" });
    }
  }
};

// ✅ Withdraw Money
const withdrawMoney = async (req, res) => {
  const { userId, balance } = req.body;
  console.log(req.body);

  if (!userId || isNaN(balance) || balance <= 0) {
    return res.status(400).json({ error: "Invalid withdrawal amount" });
  }

  try {
    await sequelize.transaction(async (t) => {
      const wallet = await Wallet.findOne({
        where: { userId },
        transaction: t,
        lock: true, // Lock the row for transaction safety
      });

      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found" });
      }

      if (wallet.winningBalance < balance) {
        return res.status(400).json({ error: "Insufficient winning balance" });
      }

      // ✅ Use wallet.update() instead of Wallet.update()
      await wallet.update(
        { winningBalance: wallet.winningBalance - parseFloat(balance) },
        { transaction: t }
      );

      // ✅ Create withdrawal transaction
      await Transaction.create(
        { userId, amount: balance, type: "withdrawal", status: "pending" },
        { transaction: t }
      );

      return res.json({ message: "Withdrawal request submitted" });
    });
  } catch (error) {
    console.error("Withdrawal Error:", error);
    return res.status(500).json({ error: "Failed to process withdrawal" });
  }
};

// ✅ Deduct Money for Game Entry
const gameEntry = async (req, res) => {
  const { userId, entryFee } = req.body;

  try {
    await sequelize.transaction(async (t) => {
      const wallet = await Wallet.findOne({
        where: { userId },
        transaction: t,
      });
      if (!wallet || wallet.balance < entryFee)
        return res.status(400).json({ error: "Insufficient balance" });

      await Wallet.update(
        { balance: wallet.balance - parseFloat(entryFee) },
        { where: { userId }, transaction: t }
      );
      await Transaction.create(
        { userId, amount: entryFee, type: "game_entry", status: "completed" },
        { transaction: t }
      );
    });

    res.json({ message: "Game entry successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Credit Winnings After Game Win
const creditWinnings = async (req, res) => {
  let { userId, winningAmount } = req.body;

  // ✅ Convert values properly
  userId = Number(userId);
  winningAmount = parseFloat(winningAmount); // Fix decimal precision

  if (!userId || isNaN(winningAmount) || winningAmount <= 0) {
    return res.status(400).json({ error: "Invalid winning amount request" });
  }

  try {
    const wallet = await Wallet.findOne({ where: { userId } });

    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found for this user." });
    }

    // ✅ Correct decimal handling
    const updatedWinningBalance =
      parseFloat(wallet.winningBalance) + winningAmount;

    // ✅ Ensure correct decimal storage
    await wallet.update({ winningBalance: updatedWinningBalance.toFixed(2) });

    res.json({
      message: "Winning balance updated successfully",
      newWinningBalance: updatedWinningBalance.toFixed(2),
    });
  } catch (error) {
    console.error("Error updating winning balance:", error);
    res.status(500).json({ error: "Failed to update winning balance" });
  }
};

// Get Transaction History
const getTransactionHistory = async (req, res) => {
  try {
    const userId = Number(req.params.userId); // ✅ Extract and convert to number

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: "Invalid userId format" });
    }

    const transactions = await Transaction.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  sendOTP,
  verifyOTP,
  Register,
  getWalletBalance,
  depositMoney,
  withdrawMoney,
  gameEntry,
  creditWinnings,
  getTransactionHistory,
  createWallet,
  createw,
};
