import { DataTypes, Sequelize } from "sequelize";
import { sequelize } from "../DB/db.user";

const Otp = sequelize.define(
  "Otp",
  {
    mobileNo: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    otp: {
      type: DataTypes.STRING(6),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    expire_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.DATE.NOW,
      get() {
        return this.getDataValue("expire_at")?.getTime(); // Get timestamp in milliseconds
      },
      set(value) {
        this.setDataValue("expire_at", new Date(value)); // Convert input to Date object
      },
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  },
  { timestamps: false }
);
export { Otp };
