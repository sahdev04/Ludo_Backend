import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { Room } from "../model/roomModel.js";

const Game = sequelize.define("Game", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  roomId: { type: DataTypes.UUID, references: { model: Room, key: "id" } },
  status: {
    type: DataTypes.ENUM("waiting", "ongoing", "finished"),
    defaultValue: "waiting",
  },
  winnerId: { type: DataTypes.UUID, allowNull: true },
});

export { Game };
