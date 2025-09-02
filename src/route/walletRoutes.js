import express from "express";
import {
  depositFunds,
  withdrawFunds,
  getWalletBalance,
  getTransactionHistory,
  addWinnings,
  deductEntryFee,
  verifyRazorpayPayment,
  createRazorpayOrder,
  getWithdrawHistory,
} from "../controller/walletController.js";
import authenticateUser from "../middleware/authmiddleware.js";
import authorizeAdmin from "../middleware/isAdmin.js";
const router = express.Router();

router.post("/deposit", authenticateUser, depositFunds);
router.post("/withdraw", authenticateUser, withdrawFunds);
router.get("/balance", authenticateUser, getWalletBalance);
router.get("/transactions", authenticateUser, getTransactionHistory);
router.post("/add-winnings", authenticateUser, addWinnings);
router.post("/deduct-entry-fee", authenticateUser, deductEntryFee);
router.post("/create-order", authenticateUser, createRazorpayOrder);
router.post("/verify-payment", authenticateUser, verifyRazorpayPayment);
router.get("/withdrawals", authenticateUser, getWithdrawHistory);
export default router;
