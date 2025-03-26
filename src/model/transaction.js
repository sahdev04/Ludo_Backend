import { DataTypes } from "sequelize";
import { sequelize } from "../DB/db.user.js";
import jwt from "jsonwebtoken";
import { User } from "./user.model.js";

const Transaction = sequelize.define(
  "Transaction",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
      onDelete: "CASCADE",
    },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    type: {
      type: DataTypes.ENUM(
        "deposit",
        "withdrawal",
        "game_entry",
        "game_win",
        "bonus_reward"
      ),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "completed", "failed"),
      allowNull: false,
    },
  },
  { timestamps: true, freezeTableName: true }
);
export { Transaction };
