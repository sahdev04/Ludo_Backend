import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../model/userModel.js";
import { uploadOnCloudinary } from "../../src/util/cloudinary.js";
//import { generateAndSaveOtp } from "../util/genrateAndsend.js";
// Temporary token blacklist storage (use Redis in production)
let tokenBlacklist = new Set();

const login = async (req, res) => {
  try {
    const { mobile } = req.body;

    // Find user
    const user = await User.findOne({ where: { mobile } });
    if (!user) {
      return res.status(400).json({ message: "Invalid number" });
    }

    // Verify password
    //const isMatch = await bcrypt.compare(password, user.password);
    //if (!isMatch) {
    //return res.status(400).json({ message: "Invalid email or password" });
    //}

    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id, mobile: user.mobile },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
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
    tokenBlacklist.add(token); // Blacklist the token if needed

    // Optionally, remove the token from a database or session if you're storing it server-side

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error logging out", error: error.message });
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
    console.log("my mobile numer", mobile);
    if (!mobile || mobile.length !== 10) {
      return res.status(400).json({ message: "Enter a valid phone number" });
    }

    let user = await User.findOne({ where: { mobile } });

    if (!user) {
      // Create new user if not exists
      user = await User.create({ mobile });
    }

    // Generate OTP and save to user
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await user.save();
    console.log("your otp", otp);
    res.status(200).json({
      message: "OTP sent to your phone number",
      otp, // ✅ Only for development; remove in production
      userId: user.id,
      mobile: user.mobile,
    });
  } catch (error) {
    console.error("Registration/Login error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// Add the missing generateAndSaveOtp function
const generateAndSaveOtp = async (mobile) => {
  try {
    const user = await User.findOne({ where: { mobile } });

    if (!user) {
      throw new Error("User not found");
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to user
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await user.save();

    return { otp };
  } catch (error) {
    throw error;
  }
};
const verifyOtp = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    // Add more detailed logging to debug the issue
    console.log("Request body:", req.body);
    console.log("Mobile from request:", mobile);
    console.log("OTP from request:", otp);

    // Check if mobile and OTP are provided
    if (!mobile || !otp) {
      return res
        .status(400)
        .json({ message: "Mobile number and OTP are required" });
    }

    // Ensure mobile is a string and properly formatted
    const formattedMobile = String(mobile).trim();
    if (formattedMobile.length !== 10) {
      return res.status(400).json({ message: "Invalid mobile number format" });
    }

    // Find the user with the provided mobile number
    const user = await User.findOne({ where: { mobile: formattedMobile } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify OTP
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check if OTP has expired
    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // Clear OTP after successful verification
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, mobile: user.mobile },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Check if the user is already registered (i.e., user has username set)
    if (!user.username) {
      return res.status(200).json({
        message: "OTP verified successfully. User is new.",
        token,
        user: { id: user.id, mobile: user.mobile, isNewUser: true },
      });
    } else {
      return res.status(200).json({
        message: "OTP verified successfully. User already exists.",
        token,
        user: { id: user.id, mobile: user.mobile, isNewUser: false },
      });
    }
  } catch (error) {
    console.error("OTP verification error:", error);
    res
      .status(500)
      .json({ message: "OTP verification failed", error: error.message });
  }
};
// RESEND OTP
const resendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;
    console.log("your backend resend", mobile);

    if (!mobile) {
      return res.status(400).json({ message: "Mobile number is required" });
    }

    const user = await User.findOne({ where: { mobile } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { otp } = await generateAndSaveOtp(mobile);

    res.status(200).json({
      message: "OTP resent successfully",
      otp, // remove in production
      userId: user.id,
      mobile: user.mobile, // Added to ensure mobile is returned to frontend
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error resending OTP", error: error.message });
  }
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

    // Generate random username if none provided
    const finalUserName =
      username && username.trim() !== ""
        ? username.trim()
        : generateRandomUsername(mobile);

    // Find user by mobile and update the username
    const user = await User.findOne({ where: { mobile } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user's username
    user.username = finalUserName;
    await user.save();

    res.status(200).json({
      message: "Username saved successfully!",
      user,
    });
  } catch (error) {
    console.error("Error saving username:", error);
    res.status(500).json({
      message: "Failed to save username",
      error: error.message,
    });
  }
};
// controllers/userController.js
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
    console.error("Upload error:", error);
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
