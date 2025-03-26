import express from "express";
import {
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
} from "../controller/user.controller.js";
const router = express.Router();

router.route("/send-otp").post(sendOTP);
router.route("/verify-otp").post(verifyOTP);
//jab otp model ko user model me convert kr dungi to registration ki koi jarurat nhi hai

router.route("/register").post(Register);
router.get("/balance/:userId", getWalletBalance);
router.post("/deposit", depositMoney);
router.post("/withdraw", withdrawMoney);
router.post("/game-entry", gameEntry);
router.post("/credit-winnings", creditWinnings);
router.get("/transactions/:userId", getTransactionHistory);
router.post("/create-wallet", createw);
export default router;
