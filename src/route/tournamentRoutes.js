import express from "express";
import {
  createTournament,
  joinTournament,
  startTournament,
  getTournamentDetails,
  endTournament,
  getAllTournaments,
} from "../controller/tournamentController.js";
import authenticateUser from "../middleware/authmiddleware.js";
import authorizeRoles from "../middleware/authorizeRole.js";
import authenticateAdmin from "../middleware/authenticateAdmin.js";
const router = express.Router();

router.post(
  "/create",
  authenticateAdmin,
  authorizeRoles("superadmin", "subadmin"),
  createTournament
);
router.post("/join", authenticateUser, joinTournament);
router.post("/start", authenticateUser, startTournament);
router.post("/end", authenticateAdmin, endTournament);
router.get(
  "/:tournamentId",
  authenticateUser,
  authenticateAdmin,
  getTournamentDetails
);
router.get(
  "/alltournaments",
  authenticateUser,
  authenticateAdmin,
  authorizeRoles("superadmin", "subadmin"),
  getAllTournaments
);

export default router;
