import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const User = sequelize.define("User", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  mobile: { type: DataTypes.STRING, allowNull: false, unique: true },
  walletBalance: { type: DataTypes.FLOAT, defaultValue: 0.0 },
  role: { type: DataTypes.ENUM("user", "admin"), defaultValue: "user" },
  otp: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  otpExpiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

export { User };
