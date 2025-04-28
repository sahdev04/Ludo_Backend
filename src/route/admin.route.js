import express from "express";
import { upload } from "../middleware/multer.middleware.js";
import isAdmin from "../middleware/isAdmin.js";
import {
  handleWithdrawalRequest,
  manualPayout,
  getAllTransactions,
  giveBonus,
} from "../controller/admin.controller.js";

const router = express.Router();
router.post("/withdrawal-request", isAdmin, handleWithdrawalRequest);
router.post("/manual-payout", isAdmin, manualPayout);
router.get("/transactions", isAdmin, getAllTransactions);
router.post("/bonus", isAdmin, giveBonus);

export default router;
