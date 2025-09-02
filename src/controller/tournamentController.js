//import { v4: uuidv4 } from "uuid";
import { Op } from "sequelize";
import {
  User,
  Room,
  Game,
  Player,
  Piece,
  Tournament,
  Transaction,
} from "../model/indexModel.js";
// Create a new tournament
const createTournament = async (req, res) => {
  try {
    const {
      title,
      entryFee,
      prizePool,
      maxPlayers,
      startDate,
      endDate,
      level,
    } = req.body;

    // Validate name
    if (!title || typeof title !== "string") {
      return res.status(400).json({ message: "Invalid tournament name" });
    }

    const entryFeeNumber = Number(entryFee);
    const prizePoolNumber = Number(prizePool);
    const maxPlayersNumber = Number(maxPlayers);
    const levelNumber = Number(level);
    // Validate numbers
    if (isNaN(entryFeeNumber) || entryFeeNumber < 0) {
      return res.status(400).json({ message: "Invalid entry fee" });
    }

    if (isNaN(prizePoolNumber) || prizePoolNumber < 0) {
      return res.status(400).json({ message: "Invalid prize pool" });
    }

    if (maxPlayers && (isNaN(maxPlayersNumber) || maxPlayersNumber <= 0)) {
      return res.status(400).json({ message: "Invalid max players value" });
    }
    if (level && (isNaN(levelNumber) || levelNumber <= 0)) {
      return res.status(400).json({ message: "Invalid level value" });
    }

    // Validate dates
    const parsedStartDate = startDate ? new Date(startDate) : null;
    const parsedEndDate = endDate ? new Date(endDate) : null;

    if (startDate && isNaN(parsedStartDate.getTime())) {
      return res.status(400).json({ message: "Invalid start date" });
    }

    if (endDate && isNaN(parsedEndDate.getTime())) {
      return res.status(400).json({ message: "Invalid end date" });
    }

    // Create the tournament
    const tournament = await Tournament.create({
      title,
      entryFee: entryFeeNumber,
      prizePool: prizePoolNumber,
      maxPlayers: maxPlayersNumber || null,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      level: levelNumber || null,
    });

    res.status(201).json({
      message: "Tournament created successfully",
      tournament,
    });
  } catch (error) {
    console.error("Tournament creation error:", error);
    res.status(500).json({
      message: "Error creating tournament",
      error: error.message,
    });
  }
};
// Join a tournament
const joinTournament = async (req, res) => {
  try {
    const { tournamentId, roomId, color } = req.body;
    const userId = req.user.id; // From auth middleware

    const tournament = await Tournament.findByPk(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Ensure both values are valid numbers
    if (isNaN(user.walletBalance) || isNaN(tournament.entryFee)) {
      return res.status(400).json({ message: "Invalid balance or entry fee" });
    }

    // Convert to fixed decimals to avoid floating-point errors
    const walletBalance = parseFloat(user.walletBalance.toFixed(2));
    const entryFee = parseFloat(tournament.entryFee.toFixed(2));

    console.log("Converted Wallet Balance:", walletBalance);
    console.log("Converted Entry Fee:", entryFee);

    if (walletBalance < entryFee) {
      return res
        .status(400)
        .json({ message: "Insufficient balance to join the tournament" });
    }

    // Deduct entry fee from user's wallet
    await user.update({
      walletBalance: user.walletBalance - tournament.entryFee,
    });

    // Log transaction
    await Transaction.create({
      userId,
      amount: -tournament.entryFee,
      type: "entry_fee",
    });

    // Add user to tournament as a player
    await Player.create({ userId, tournamentId, roomId, color });

    res.json({ message: "Successfully joined the tournament" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error joining tournament", error: error.message });
  }
};

// Start a tournament
const startTournament = async (req, res) => {
  try {
    const { tournamentId } = req.body;

    const tournament = await Tournament.findByPk(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    if (tournament.status !== "upcoming") {
      return res
        .status(400)
        .json({ message: "Tournament already started or completed" });
    }

    await tournament.update({ status: "ongoing" });

    res.json({ message: "Tournament started successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error starting tournament", error: error.message });
  }
};

// Get tournament details
const getTournamentDetails = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const tournament = await Tournament.findOne({
      where: { id: tournamentId },
      include: [{ model: Player, include: [User] }],
    });

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    res.json(tournament);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching tournament details",
      error: error.message,
    });
  }
};
// End a tournament and distribute prizes
const endTournament = async (req, res) => {
  try {
    const { tournamentId, winnerId } = req.body;

    const tournament = await Tournament.findByPk(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    if (tournament.status !== "ongoing") {
      return res
        .status(400)
        .json({ message: "Tournament is not currently active" });
    }

    const winner = await User.findByPk(winnerId);
    if (!winner) {
      return res.status(404).json({ message: "Winner not found" });
    }

    // Add prize to winner's wallet
    await winner.update({
      walletBalance: winner.walletBalance + tournament.prizePool,
    });

    // Log transaction
    await Transaction.create({
      userId: winnerId,
      amount: tournament.prizePool,
      type: "win",
    });

    // Mark tournament as completed
    await tournament.update({ status: "completed" });

    res.json({ message: "Tournament completed and prize awarded" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error ending tournament", error: error.message });
  }
};

// Get all tournaments
const getAllTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.findAll();
    res.json(tournaments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching tournaments", error: error.message });
  }
};

export {
  createTournament,
  joinTournament,
  startTournament,
  getTournamentDetails,
  endTournament,
  getAllTournaments,
};
