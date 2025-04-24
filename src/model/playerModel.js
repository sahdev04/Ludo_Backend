import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { User } from "./userModel.js";
import { Game } from "./gameModel.js";
import { Tournament } from "./tournamentModel.js";

const Player = sequelize.define("Player", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: { type: DataTypes.UUID, references: { model: User, key: "id" } },
  roomId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "Rooms", // Ensure this matches your Rooms table name
      key: "id",
    },
  },
  gameId: { type: DataTypes.UUID, references: { model: Game, key: "id" } },
  color: {
    type: DataTypes.ENUM("red", "blue", "green", "yellow"),
    allowNull: false,
  },
  isTurn: { type: DataTypes.BOOLEAN, defaultValue: false },
});

export { Player };
