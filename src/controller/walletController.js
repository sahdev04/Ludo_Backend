import { Op } from "sequelize";
import { sequelize } from "../config/database.js";
import { User } from "../model/userModel.js";
import { Transaction } from "../model/transactionModel.js";
import crypto from "crypto";
import Razorpay from "razorpay";
import dotenv from "dotenv";
dotenv.config();

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Deposit funds into wallet
const depositFunds = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { amount, razorpayPaymentId } = req.body;
    const userId = req.user.id;

    // Validate amount
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      await t.rollback();
      return res.status(400).json({ message: "Invalid deposit amount" });
    }

    // Verify Razorpay payment
    const payment = await instance.payments.fetch(razorpayPaymentId);
    if (payment.status !== "captured") {
      await t.rollback();
      return res.status(400).json({ message: "Payment not captured" });
    }

    // Find user
    const user = await User.findByPk(userId, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ message: "User not found" });
    }

    // Create transaction record
    const transaction = await Transaction.create(
      {
        userId,
        amount: depositAmount,
        type: "deposit",
        status: "pending",
      },
      { transaction: t }
    );

    // Update transaction status to completed
    await transaction.update({ status: "completed" }, { transaction: t });

    // Update user's wallet balance
    await user.update(
      {
        walletBalance: parseFloat(
          (user.walletBalance + depositAmount).toFixed(2)
        ),
      },
      { transaction: t }
    );

    await t.commit();

    res.json({
      message: "Deposit successful",
      walletBalance: user.walletBalance,
    });
  } catch (error) {
    await t.rollback();
    console.error("Deposit Funds Error:", error);
    res
      .status(500)
      .json({ message: "Error depositing funds", error: error.message });
  }
};

// Withdraw funds from wallet
const withdrawFunds = async (req, res) => {
  try {
    const { amount, mobile } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0 || !mobile) {
      return res
        .status(400)
        .json({ message: "Amount or phone number missing" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.walletBalance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Deduct wallet immediately (you can delay this if needed)
    await user.update({ walletBalance: user.walletBalance - amount });

    // Create transaction
    const transaction = await Transaction.create({
      userId,
      amount: -amount,
      type: "withdrawal",
      mobile,
      status: "pending", // admin may later approve this
    });

    // Simulate payout via Razorpay (you would replace this with the actual payout API)
    setTimeout(async () => {
      await transaction.update({ status: "completed" });
    }, 2000);

    return res.json({
      message: "Withdrawal requested successfully",
      walletBalance: user.walletBalance,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error processing withdrawal",
      error: error.message,
    });
  }
};

// Get user wallet balance
const getWalletBalance = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const transactions = await Transaction.findAll({
      where: {
        userId,
        status: "completed",
      },
    });

    let deposits = 0;
    let winnings = 0;
    let bonus = 0;

    for (let tx of transactions) {
      if (tx.type === "deposit") deposits += tx.amount;
      else if (tx.type === "win") winnings += tx.amount;
      else if (tx.type === "bonus") bonus += tx.amount;
    }

    res.json({
      walletBalance: user.walletBalance,
      deposits,
      winnings,
      bonus,
    });
  } catch (error) {
    console.error("Get Wallet Balance Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Handle winnings from a game
const addWinnings = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { amount } = req.body;
    const userId = req.user.id; // assuming you have user attached by auth middleware

    const winningAmount = parseFloat(amount);
    if (isNaN(winningAmount) || winningAmount <= 0) {
      return res.status(400).json({ message: "Invalid winning amount" });
    }

    const user = await User.findByPk(userId, { transaction: t });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newBalance = parseFloat(
      (user.walletBalance + winningAmount).toFixed(2)
    );

    await user.update({ walletBalance: newBalance }, { transaction: t });

    await Transaction.create(
      {
        userId,
        amount: winningAmount,
        type: "win",
        status: "completed",
      },
      { transaction: t }
    );

    await t.commit();

    res.json({
      message: "Winnings added successfully",
      walletBalance: newBalance,
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({
      message: "Error adding winnings",
      error: error.message,
    });
  }
};

// Deduct entry fee from wallet when joining a tournament
const deductEntryFee = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id; // Assumes auth middleware sets this
    const entryFee = parseFloat(amount);
    if (isNaN(entryFee) || entryFee <= 0) {
      return res.status(400).json({ message: "Invalid entry fee amount" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentBalance = parseFloat(user.walletBalance);
    if (currentBalance < entryFee) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const newBalance = parseFloat((currentBalance - entryFee).toFixed(2));

    // Update wallet balance
    await user.update({ walletBalance: newBalance });

    // Log transaction
    await Transaction.create({
      userId,
      amount: -entryFee,
      type: "entry_fee",
      status: "completed",
    });

    res.json({
      message: "Entry fee deducted successfully",
      walletBalance: newBalance,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deducting entry fee",
      error: error.message,
    });
  }
};

// Step 1: Initiate a Razorpay Order for wallet deposit
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      return res.status(400).json({ message: "Invalid deposit amount" });
    }

    const options = {
      amount: Math.round(depositAmount * 100), // in paise
      currency: "INR",
      receipt: `wallet_deposit_${userId}_${Date.now()}`,
    };

    const order = await instance.orders.create(options);

    res.json({
      success: true,
      orderId: order.id,
      amount: depositAmount,
      currency: order.currency,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create Razorpay order",
      error: error.message,
    });
  }
};

// Step 2: Verify Razorpay payment and update wallet
const verifyRazorpayPayment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
    } = req.body;
    const userId = req.user.id;

    // Step 1: Verify Signature
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Step 2: Credit user wallet
    const user = await User.findByPk(userId, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ message: "User not found" });
    }

    const depositAmount = parseFloat(amount);
    const newBalance = parseFloat(
      (user.walletBalance + depositAmount).toFixed(2)
    );

    await user.update({ walletBalance: newBalance }, { transaction: t });

    await Transaction.create(
      {
        userId,
        amount: depositAmount,
        type: "deposit",
        status: "completed",
        referenceId: razorpay_payment_id,
      },
      { transaction: t }
    );

    await t.commit();
    res.json({
      message: "Deposit successful",
      walletBalance: newBalance,
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({
      message: "Error verifying payment",
      error: error.message,
    });
  }
};

// Fetch Transaction History
const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactions = await Transaction.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      attributes: ["type", "amount", "status", "createdAt"],
    });

    res.json({ transactions });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching transaction history",
      error: error.message,
    });
  }
};

// Get only successful withdrawal transactions
const getWithdrawHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const withdrawals = await Transaction.findAll({
      where: {
        userId,
        type: "withdrawal",
        status: "completed",
      },
      order: [["createdAt", "DESC"]],
      attributes: ["id", "amount", "status", "createdAt"],
    });

    const formattedWithdrawals = withdrawals.map((tx) => ({
      id: tx.id,
      amount: parseFloat(Math.abs(tx.amount)), // withdrawal amounts are stored as negative
      status: tx.status,
      date: tx.createdAt,
    }));
    res.json({ withdrawals: formattedWithdrawals });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching withdraw history",
      error: error.message,
    });
  }
};

export {
  depositFunds,
  withdrawFunds,
  getWalletBalance,
  addWinnings,
  deductEntryFee,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getTransactionHistory,
  getWithdrawHistory,
};
