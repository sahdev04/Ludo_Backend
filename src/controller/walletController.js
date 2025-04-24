//import{ v4: uuidv4 } from "uuid";
import { Op } from "sequelize";
import { sequelize } from "../config/database.js";
import { User } from "../model/userModel.js";
import { Transaction } from "../model/transactionModel.js";

// Deposit funds into wallet
const depositFunds = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      return res.status(400).json({ message: "Invalid deposit amount" });
    }

    const user = await User.findByPk(userId, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ message: "User not found" });
    }

    const transaction = await Transaction.create(
      {
        userId,
        amount: depositAmount,
        type: "deposit",
        status: "pending",
      },
      { transaction: t }
    );

    await transaction.update({ status: "completed" }, { transaction: t });

    await user.update(
      {
        wallet_balance: parseFloat(
          (user.wallet_balance + depositAmount).toFixed(2)
        ),
      },
      { transaction: t }
    );

    await t.commit();
    res.json({
      message: "Deposit successful",
      wallet_balance: user.wallet_balance,
    });
  } catch (error) {
    await t.rollback();
    res
      .status(500)
      .json({ message: "Error depositing funds", error: error.message });
  }
};

// Withdraw funds from wallet
const withdrawFunds = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid withdrawal amount" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.walletBalance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Create withdrawal transaction with pending status
    const transaction = await Transaction.create({
      userId,
      amount: -amount, // Negative amount for withdrawal
      type: "withdrawal",
      status: "pending",
    });

    // Simulate successful withdrawal (update status in real case after admin approval)
    await transaction.update({ status: "completed" });

    // Deduct from wallet balance
    await user.update({ walletBalance: user.walletBalance - amount });

    res.json({
      message: "Withdrawal successful",
      walletBalance: user.walletBalance,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error processing withdrawal", error: error.message });
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

    res.json({ walletBalance: user.walletBalance });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching wallet balance", error: error.message });
  }
};

// Get all transactions for a user
const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = await Transaction.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });

    res.json({ transactions });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching transaction history",
      error: error.message,
    });
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
    console.log(amount);
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

export {
  depositFunds,
  withdrawFunds,
  getWalletBalance,
  getTransactionHistory,
  addWinnings,
  deductEntryFee,
};
