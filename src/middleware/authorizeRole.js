import jwt from "jsonwebtoken";
import { Admin } from "../model/adminModel.js";
import { sequelize } from "../config/database.js";
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

export default authorizeRoles;
