import express from "express";
import {
  createRoom,
  joinRoom,
  leaveRoom,
  startGame,
  getRoomDetails,
} from "../controller/roomController.js";
import authenticateUser from "../middleware/authmiddleware.js";
import authorizeAdmin from "../middleware/isAdmin.js";
const router = express.Router();

router.post("/create", authenticateUser, authorizeAdmin, createRoom);
router.post("/join", authenticateUser, joinRoom);
router.post("/leave", authenticateUser, leaveRoom);
router.post("/start", startGame);
router.get("/:roomCode", getRoomDetails);

export default router;
