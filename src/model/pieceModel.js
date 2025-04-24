import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { Player } from "./playerModel.js";

const Piece = sequelize.define("Piece", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  playerId: { type: DataTypes.UUID, references: { model: Player, key: "id" } },
  position: { type: DataTypes.INTEGER, defaultValue: 0 }, // 0 means starting point
  isHome: { type: DataTypes.BOOLEAN, defaultValue: false }, // True if reached the goal
});

export { Piece };
