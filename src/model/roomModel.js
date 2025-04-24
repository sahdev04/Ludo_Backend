import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Room = sequelize.define("Room", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  roomCode: { type: DataTypes.STRING, allowNull: false, unique: true },
  maxPlayers: { type: DataTypes.INTEGER, defaultValue: 4 },
  status: {
    type: DataTypes.ENUM("waiting", "in_progress", "completed"),
    defaultValue: "waiting",
  },
});
export { Room };
