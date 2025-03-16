import { User } from "../model/user.model.js";
import jwt from "jsonwebtoken";
import { where } from "sequelize";
const generateAccessTokenandRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ message: "user not found" });
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error generating tokens:", error.message);
    throw new APIError(
      500,
      "something went wrong while generating refresh and access token"
    );
  }
};
const Register = async (req, res) => {
  try {
    const { username, mobileNo } = req.body;
    if ([username, mobileNo].some((field) => field?.trim() === "")) {
      return res.status(500).json({ message: "all fields are required" });
    }

    const existuser = await User.findOne({
      where: { mobileNo },
    });

    if (existuser) {
      return res.status(400).json({
        message: "user with this mobile number and username already exist",
      });
    }

    const newuser = await User.create({
      username,
      mobileNo,
    });

    return res
      .status(200)
      .json({ message: "user sregister successful", user: newuser });
  } catch (error) {
    console.error("registration erro : ", error);
    return res.status(500).json({ message: "internal server error" });
  }
};

export { Register, generateAccessTokenandRefreshToken };
