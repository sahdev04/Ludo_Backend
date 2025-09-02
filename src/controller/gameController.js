import { Op } from "sequelize";
import { Game } from "../model/gameModel.js";
import { Room } from "../model/roomModel.js";
import { Player } from "../model/playerModel.js";
import { Piece } from "../model/pieceModel.js";
//import { v4:uuidv4 } from "uuid";
import { io } from "../index.js";
// Create a new game
const createGame = async (req, res) => {
  try {
    const { roomId } = req.body;
    const players = await Player.findAll({ where: { roomId } });

    if (players.length !== 4) {
      return res
        .status(400)
        .json({ message: "A game requires exactly 4 players." });
    }

    const game = await Game.create({ roomId, turn: players[0].id });
    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Roll dice
const rollDice = async (req, res) => {
  try {
    const { gameId, playerId } = req.body;
    console.log(gameId, playerId);
    if (!gameId || !playerId) {
      return res
        .status(400)
        .json({ message: "gameId and playerId are required" });
    }

    const game = await Game.findByPk(gameId);
    if (!game) return res.status(404).json({ message: "Game not found" });

    // Ensure it's the correct player's turn
    if (String(game.isTurn) !== String(playerId)) {
      return res.status(400).json({ message: "Not your turn" });
    }

    // Roll the dice (random number between 1 and 6)
    const diceRoll = Math.floor(Math.random() * 6) + 1;

    // Broadcast event to all players in the game
    io.emit("diceRolled", { playerId, diceRoll });

    res.json({ message: "Dice rolled", diceRoll });
  } catch (error) {
    console.error("Error rolling dice:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Move piece
const movePiece = async (req, res) => {
  try {
    const { piece_id, steps } = req.body;
    const piece = await Piece.findByPk(piece_id);
    if (!piece) return res.status(404).json({ message: "Piece not found" });

    piece.position += steps;
    await piece.save();
    io.emit("pieceMoved", { piece_id, newPosition: piece.position });
    res.json({ message: "Piece moved successfully", piece });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// End turn and switch to next player
const endTurn = async (req, res) => {
  try {
    const { game_id } = req.body;
    const game = await Game.findByPk(game_id);
    if (!game) return res.status(404).json({ message: "Game not found" });

    const players = await Player.findAll({ where: { room_id: game.room_id } });
    const currentIndex = players.findIndex((p) => p.id === game.turn);
    const nextIndex = (currentIndex + 1) % players.length;
    game.turn = players[nextIndex].id;
    await game.save();

    io.emit("turnChanged", { nextPlayer: game.turn });
    res.json({ message: "Turn updated", nextPlayer: game.turn });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Check for winner
const checkWinner = async (req, res) => {
  try {
    const { game_id } = req.body;
    const pieces = await Piece.findAll({ where: { game_id } });
    const completedPlayers = new Set();
    pieces.forEach((piece) => {
      if (piece.position >= 100) completedPlayers.add(piece.player_id);
    });
    if (completedPlayers.size === 1) {
      io.emit("gameWon", { winner: [...completedPlayers][0] });
      res.json({ message: "Game won", winner: [...completedPlayers][0] });
    } else {
      res.json({ message: "Game ongoing" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Forfeit game
const forfeitGame = async (req, res) => {
  try {
    const { game_id, player_id } = req.body;
    const game = await Game.findByPk(game_id);
    if (!game) return res.status(404).json({ message: "Game not found" });

    await Player.destroy({ where: { id: player_id } });
    io.emit("playerForfeited", { player_id });
    res.json({ message: "Player forfeited the game" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
export { createGame, rollDice, movePiece, endTurn, checkWinner, forfeitGame };
