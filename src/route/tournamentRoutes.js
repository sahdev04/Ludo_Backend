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
import authorizeAdmin from "../middleware/isAdmin.js";
const router = express.Router();

router.post("/create", authenticateUser, authorizeAdmin, createTournament);
router.post("/join", authenticateUser, joinTournament);
router.post("/start", authenticateUser, startTournament);
router.post("/end", authorizeAdmin, endTournament);
router.get(
  "/:tournamentId",
  authenticateUser,
  authorizeAdmin,
  getTournamentDetails
);
router.get("/", authenticateUser, getAllTournaments);

export default router;
