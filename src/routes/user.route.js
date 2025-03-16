import express from "express";
import {
  Register,
  generateAccessTokenandRefreshToken,
} from "../controller/user.controller.js";
const router = express.Router();

router.route("/register").post(Register);

export default router;
