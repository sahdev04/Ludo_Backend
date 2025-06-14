// models/ReferSettings.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const ReferSettings = sequelize.define("ReferSettings", {
  referralBonus: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    allowNull: false,
  },
  minWithdrawAmount: {
    type: DataTypes.INTEGER,
    defaultValue: 200,
    allowNull: false,
  },
});

export { ReferSettings };
