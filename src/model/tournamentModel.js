import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { Player } from "./playerModel.js";
const Tournament = sequelize.define("Tournament", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: { type: DataTypes.STRING, allowNull: false },
  entryFee: { type: DataTypes.FLOAT, allowNull: false },
  prizePool: { type: DataTypes.FLOAT, defaultValue: 0.0 },
  status: {
    type: DataTypes.ENUM("upcoming", "ongoing", "completed"),
    defaultValue: "upcoming",
  },
});
export { Tournament };
