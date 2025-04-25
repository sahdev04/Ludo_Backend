import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { User } from "./userModel.js";

const Transaction = sequelize.define("Transaction", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: { type: DataTypes.UUID, references: { model: User, key: "id" } },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  type: {
    type: DataTypes.ENUM("deposit", "withdrawal", "win", "entry_fee", "bonus"),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("pending", "completed", "failed"),
    defaultValue: "pending",
  },
});

export { Transaction };
