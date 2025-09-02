import express from "express";
const router = express.Router();
import {
  createGame,
  rollDice,
  movePiece,
  endTurn,
  checkWinner,
  forfeitGame,
} from "../controller/gameController.js";
import authenticateUser from "../middleware/authmiddleware.js";
router.post("/create", authenticateUser, createGame);
router.post("/roll-dice", authenticateUser, rollDice);
router.post("/move-piece", authenticateUser, movePiece);
router.post("/end-turn", authenticateUser, endTurn);
router.post("/check-winner", authenticateUser, checkWinner);
router.post("/forfeit", authenticateUser, forfeitGame);

export default router;
