import jwt from "jsonwebtoken";
import { User } from "../model/userModel.js"; // Ensure User model is correctly imported
import { sequelize } from "../config/database.js"; // Adjust the path based on your file structure

const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Authorization header malformed or missing" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token missing" });

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Use Sequelize to find the user by ID
    const user = await User.findOne({
      where: { id: decoded.id }, // Assuming 'id' is the field for user identification
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user; // Attach the user data to the request object
    next(); // Continue to next middleware or route handler
  } catch (error) {
    res.status(403).json({ message: "Invalid token", error: error.message });
  }
};

export default authenticateUser;
