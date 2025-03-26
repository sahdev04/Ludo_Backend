import { DataTypes } from "sequelize";
import { sequelize } from "../DB/db.user.js";
import jwt from "jsonwebtoken";
const User = sequelize.define(
  "User",
  {
    mobileNo: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isNumeric: true,
      },
    },
    refreshToken: {
      type: DataTypes.STRING,
    },
  },
  { timestamps: true, freezeTableName: true }
);

User.prototype.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this.id,
      mobileNo: this.mobileNo,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
User.prototype.generateRefreshToken = function () {
  return jwt.sign(
    {
      id: this.id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export { User };
