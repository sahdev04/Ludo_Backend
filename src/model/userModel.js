import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const User = sequelize.define("User", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: { type: DataTypes.STRING, allowNull: false },
  mobile: { type: DataTypes.STRING, allowNull: false, unique: true },
  referralCode: { type: DataTypes.STRING },
  referredBy: { type: DataTypes.STRING },
  role: { type: DataTypes.ENUM("user", "admin"), defaultValue: "user" },
  otp: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  otpExpiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  walletBalance: { type: DataTypes.INTEGER, defaultValue: 0 },
  referralBonus: { type: DataTypes.INTEGER, defaultValue: 0 },
  winnings: { type: DataTypes.INTEGER, defaultValue: 0 },
  accountStatus: {
    type: DataTypes.ENUM("Verified", "Unverified"),
    defaultValue: "Unverified",
  },
  kycStatus: {
    type: DataTypes.ENUM("Submitted", "Not Submitted"),
    defaultValue: "Not Submitted",
  },
  status: {
    type: DataTypes.ENUM("Active", "Inactive", "Banned"),
    defaultValue: "Active",
  },
  registeredOn: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  lastActive: { type: DataTypes.DATE },
  totalReferrals: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalDeposit: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalWithdraws: { type: DataTypes.INTEGER, defaultValue: 0 },
  playedMatches: { type: DataTypes.INTEGER, defaultValue: 0 },
  wonMatches: { type: DataTypes.INTEGER, defaultValue: 0 },
  lostMatches: { type: DataTypes.INTEGER, defaultValue: 0 },
});

export { User };
/*
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

export { User };*/
