import { DataTypes } from "sequelize";
import { sequelize } from "../DB/db.user.js";
import jwt from "jsonwebtoken";
const User = sequelize.define(
  "User",
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
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
  { timestamps: true }
);

User.prototype.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
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
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};
export { User };
