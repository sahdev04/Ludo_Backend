import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../model/userModel.js";
import { uploadOnCloudinary } from "../../src/util/cloudinary.js";

// Temporary token blacklist storage (use Redis in production)
let tokenBlacklist = new Set();

const login = async (req, res) => {
  try {
    const { mobile } = req.body;

    const user = await User.findOne({ where: { mobile } });
    if (!user) {
      return res.status(400).json({ message: "Invalid number" });
    }

    const token = jwt.sign(
      { id: user.id, mobile: user.mobile },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, mobile: user.mobile },
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    tokenBlacklist.add(token);
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error logging out", error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "username", "mobile", "walletBalance"],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile fetched successfully",
      user: {
        id: user.id,
        username: user.username,
        mobile: user.mobile,
        walletBalance: user.walletBalance,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching profile",
      error: error.message,
    });
  }
};

// REGISTER/LOGIN
const register = async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile || mobile.length !== 10) {
      return res.status(400).json({ message: "Enter a valid phone number" });
    }

    let user = await User.findOne({ where: { mobile } });
    if (!user) {
      user = await User.create({ mobile });
    }

    // पहले OTP बनाते थे, अब सिर्फ user return करेंगे
    res.status(200).json({
      message: "User registered/login successful",
      userId: user.id,
      mobile: user.mobile,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ OTP Bypassed
const verifyOtp = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({ message: "Mobile number is required" });
    }

    const formattedMobile = String(mobile).trim();
    if (formattedMobile.length !== 10) {
      return res.status(400).json({ message: "Invalid mobile number format" });
    }

    const user = await User.findOne({ where: { mobile: formattedMobile } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ⚡ Direct JWT without OTP check
    const token = jwt.sign(
      { id: user.id, mobile: user.mobile },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    if (!user.username) {
      return res.status(200).json({
        message: "Bypassed OTP. User is new.",
        token,
        user: { id: user.id, mobile: user.mobile, isNewUser: true },
      });
    } else {
      return res.status(200).json({
        message: "Bypassed OTP. User already exists.",
        token,
        user: { id: user.id, mobile: user.mobile, isNewUser: false },
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "OTP verification failed", error: error.message });
  }
};

const resendOtp = async (req, res) => {
  return res.status(200).json({ message: "OTP bypass mode active" });
};

function generateRandomUsername(mobile) {
  const randomChars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";

  for (let i = 0; i < 5; i++) {
    randomString += randomChars.charAt(
      Math.floor(Math.random() * randomChars.length)
    );
  }
  return `User${mobile.substring(mobile.length - 4)}_${randomString}`;
}

const submitUserName = async (req, res) => {
  try {
    const { username, mobile } = req.body;
    if (!mobile) {
      return res.status(400).json({ message: "Mobile number is required." });
    }

    const finalUserName =
      username && username.trim() !== ""
        ? username.trim()
        : generateRandomUsername(mobile);

    const user = await User.findOne({ where: { mobile } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.username = finalUserName;
    await user.save();

    res.status(200).json({
      message: "Username saved successfully!",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to save username",
      error: error.message,
    });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    const avatarPath = req.file?.path;
    if (!avatarPath) {
      return res.status(400).json({ message: "No image provided" });
    }

    const uploadedImage = await uploadOnCloudinary(avatarPath);
    if (!uploadedImage?.secure_url) {
      return res.status(500).json({ message: "Cloudinary upload failed" });
    }

    const [updated] = await User.update(
      { avatar: uploadedImage.secure_url },
      { where: { id: req.user.id } }
    );

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ avatarUrl: uploadedImage.secure_url });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export {
  register,
  login,
  logout,
  getProfile,
  verifyOtp,
  resendOtp,
  submitUserName,
  uploadAvatar,
};
