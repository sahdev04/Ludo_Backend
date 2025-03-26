//Tracks user balances and transactions.
import { DataTypes } from "sequelize";
import { sequelize } from "../DB/db.user.js";
import jwt from "jsonwebtoken";
import { User } from "./user.model.js"; // Assuming User model exists

const Wallet = sequelize.define(
  "Wallet",
  {
    userId: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
      references: { model: User, key: "id" },
      onDelete: "CASCADE",
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    bonusBalance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    winningBalance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    currency: { type: DataTypes.STRING, allowNull: false, defaultValue: "INR" },
  },
  { timestamps: true, freezeTableName: true }
);

export { Wallet };
