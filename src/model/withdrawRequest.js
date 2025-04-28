// Sequelize model ka idea
import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
const WithdrawalRequest = sequelize.define("WithdrawalRequest", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("pending", "approved", "rejected"),
    defaultValue: "pending",
  },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
});

export { WithdrawalRequest };
