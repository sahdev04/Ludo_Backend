//import { v4: uuidv4 } from "uuid";
import { Op } from "sequelize";
import { Room } from "../model/roomModel.js";
import { Player } from "../model/playerModel.js";
import { User } from "../model/userModel.js";
import { sequelize } from "../config/database.js";

// Generate a unique room code
const generateRoomCode = async () => {
  let roomCode;
  let exists = true;

  while (exists) {
    roomCode = Math.random().toString(36).substr(2, 6).toUpperCase(); // Generate 6-character code
    exists = await Room.findOne({ where: { roomCode } });
  }

  return roomCode;
};

// Create a new room
const createRoom = async (req, res) => {
  try {
    const { maxPlayers } = req.body;
    const roomCode = await generateRoomCode();

    const room = await Room.create({ roomCode, maxPlayers });

    res.status(201).json({ message: "Room created successfully", room });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating room", error: error.message });
  }
};

// Join a room
const joinRoom = async (req, res) => {
  try {
    const { roomCode, color } = req.body;
    const userId = req.user.id; // Extracted from auth middleware

    // Validate color input
    const allowedColors = ["red", "blue", "green", "yellow"];
    if (!color || !allowedColors.includes(color)) {
      return res.status(400).json({ message: "Invalid or missing color" });
    }

    const room = await Room.findOne({ where: { roomCode } });
    if (!room) return res.status(404).json({ message: "Room not found" });

    const playersCount = await Player.count({ where: { roomId: room.id } });

    if (playersCount >= room.maxPlayers) {
      return res.status(400).json({ message: "Room is full" });
    }

    // Check if user is already in room
    const existingPlayer = await Player.findOne({
      where: { userId, roomId: room.id },
    });
    if (existingPlayer) {
      return res.status(400).json({ message: "You are already in this room" });
    }

    // Create player with color
    await Player.create({ userId, roomId: room.id, color });

    res.json({ message: "Joined room successfully", roomId: room.id });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error joining room", error: error.message });
  }
};

// Leave a room

const leaveRoom = async (req, res) => {
  try {
    const { roomCode } = req.body;
    if (!roomCode) {
      return res.status(400).json({ message: "Room code is required" });
    }

    const userId = req.user?.id; // Ensure req.user is available
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const room = await Room.findOne({ where: { roomCode } });
    if (!room) return res.status(404).json({ message: "Room not found" });

    const player = await Player.findOne({ where: { userId, roomId: room.id } });
    if (!player) {
      return res.status(400).json({ message: "You are not in this room" });
    }

    // Start a transaction to handle concurrent updates
    await sequelize.transaction(async (t) => {
      await player.destroy({ transaction: t });

      // Check remaining players in the room
      const playersCount = await Player.count({
        where: { roomId: room.id },
        transaction: t,
      });

      // If no players left, delete the room
      if (playersCount === 0) {
        await room.destroy({ transaction: t });
      }
    });

    res.json({ message: "Left room successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error leaving room", error: error.message });
  }
};

// Start a game when enough players are in the room
const startGame = async (req, res) => {
  try {
    const { roomCode } = req.body;

    // Find the room by roomCode
    const room = await Room.findOne({ where: { roomCode } });
    if (!room) return res.status(404).json({ message: "Room not found" });

    // Check if the game is already in progress
    if (room.status === "in_progress") {
      return res.status(400).json({ message: "Game has already started" });
    }

    // Count the number of players in the room
    const players = await Player.findAll({ where: { roomId: room.id } });
    if (players.length < 2) {
      return res
        .status(400)
        .json({ message: "Not enough players to start the game" });
    }

    // Ensure each player has a unique color
    const assignedColors = new Set(players.map((player) => player.color));
    if (assignedColors.size !== players.length) {
      return res
        .status(400)
        .json({ message: "Each player must have a unique color" });
    }

    // Start the game by updating room status
    await room.update({ status: "in_progress" });

    res.json({ message: "Game started successfully", roomId: room.id });
  } catch (error) {
    console.error("Error starting game:", error);
    res
      .status(500)
      .json({ message: "Error starting game", error: error.message });
  }
};

// Get room details
const getRoomDetails = async (req, res) => {
  try {
    const { roomCode } = req.params;

    // Fetch room with players and users
    const room = await Room.findOne({
      where: { roomCode },
      include: [
        {
          model: Player,
          include: [
            {
              model: User,
              attributes: ["id", "username", "email"], // Only include necessary fields
            },
          ],
        },
      ],
    });

    if (!room) return res.status(404).json({ message: "Room not found" });

    res.json(room);
  } catch (error) {
    console.error("Error fetching room details:", error);
    res
      .status(500)
      .json({ message: "Error fetching room details", error: error.message });
  }
};

export { createRoom, joinRoom, leaveRoom, startGame, getRoomDetails };
