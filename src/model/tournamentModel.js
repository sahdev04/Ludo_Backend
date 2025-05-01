import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { Player } from "./playerModel.js";

const Tournament = sequelize.define("Tournament", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: { type: DataTypes.STRING, allowNull: false },
  entryFee: { type: DataTypes.FLOAT, allowNull: false },
  prizePool: { type: DataTypes.FLOAT, defaultValue: 0.0 },
  status: {
    type: DataTypes.ENUM("upcoming", "ongoing", "completed"),
    defaultValue: "upcoming",
  },
  maxPlayers: {
    type: DataTypes.INTEGER,
    allowNull: true, // change to false if it's required
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true, // change to false if it's required
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true, // change to false if it's required
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: true, // or use ENUM if you have specific levels
  },
});

export { Tournament };
