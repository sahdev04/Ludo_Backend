import { sequelize } from "../config/database.js";

// Import all models
import { User } from "./userModel.js";
import { Room } from "./roomModel.js";
import { Game } from "./gameModel.js";
import { Player } from "./playerModel.js";
import { Piece } from "./pieceModel.js";
import { Tournament } from "./tournamentModel.js";
import { Transaction } from "./transactionModel.js";
import { Notification } from "./notification.js";

// Tournament ↔ Players
Tournament.hasMany(Player, { foreignKey: "tournamentId", onDelete: "CASCADE" });
Player.belongsTo(Tournament, { foreignKey: "tournamentId" });

// Tournament ↔ Games
Tournament.hasMany(Game, { foreignKey: "tournamentId", onDelete: "CASCADE" });
Game.belongsTo(Tournament, { foreignKey: "tournamentId" });

// User ↔ Players
User.hasMany(Player, { foreignKey: "userId", onDelete: "CASCADE" });
Player.belongsTo(User, { foreignKey: "userId" });

// User ↔ Transactions
User.hasMany(Transaction, { foreignKey: "userId", onDelete: "CASCADE" });
Transaction.belongsTo(User, { foreignKey: "userId" });

// Room ↔ Players
Room.hasMany(Player, { foreignKey: "roomId", onDelete: "CASCADE" });
Player.belongsTo(Room, { foreignKey: "roomId" });

// Room ↔ Games
Room.hasMany(Game, { foreignKey: "roomId", onDelete: "CASCADE" });
Game.belongsTo(Room, { foreignKey: "roomId" });

// Game ↔ Players
Game.hasMany(Player, { foreignKey: "gameId", onDelete: "CASCADE" });
Player.belongsTo(Game, { foreignKey: "gameId" });

// Player ↔ Pieces
Player.hasMany(Piece, { foreignKey: "playerId", onDelete: "CASCADE" });
Piece.belongsTo(Player, { foreignKey: "playerId" });

User.hasMany(Notification, { foreignKey: "userId" });
Notification.belongsTo(User, { foreignKey: "userId" });

// Sync Database (optional during dev)
sequelize
  .sync({ alter: true }) // Use { force: true } to reset database
  .then(() => console.log("✅ Database synced successfully"))
  .catch((err) => console.error("❌ Error syncing database:", err));

// Export all models
export { sequelize, User, Room, Game, Player, Piece, Tournament, Transaction };
