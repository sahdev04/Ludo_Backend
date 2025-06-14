import express from "express";
import { upload } from "../middleware/multer.middleware.js";
import authorizeRoles from "../middleware/authorizeRole.js";
import authenticateAdmin from "../middleware/authenticateAdmin.js";
import {
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
} from "../controller/admin.controller.js";

const router = express.Router();
router.post(
  "/register-subadmin",
  authenticateAdmin,
  authorizeRoles("superadmin"),
  registerAdmin
);
router.post("/login", loginAdmin);
router.put(
  "/update-subadmin/:id",
  authenticateAdmin,
  authorizeRoles("superadmin"),
  updateSubadmin
);

router.delete(
  "/delete-subadmin/:id",
  authenticateAdmin,
  authorizeRoles("superadmin"),
  deleteSubadmin
);
router.get(
  "/subadmins",
  authenticateAdmin,
  authorizeRoles("superadmin"),
  getAllSubadmins
);
router.get(
  "/allusers",
  authenticateAdmin,
  authorizeRoles("superadmin", "subadmin"),
  getAllUsers
);

router.get(
  "/getSingleUser/:id",
  authenticateAdmin,
  authorizeRoles("superadmin", "subadmin"),
  getUserDetails
);

router.post(
  "/ban-toggle",
  authenticateAdmin,
  authorizeRoles("superadmin", "subadmin"),
  banOrUnbanUser
);
/*router.post("/withdrawal-request", isAdmin, handleWithdrawalRequest);
router.post("/manual-payout", isAdmin, manualPayout);
router.get("/transactions", isAdmin, getAllTransactions);
router.post("/bonus", isAdmin, giveBonus);*/

export default router;
