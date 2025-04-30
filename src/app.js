import { sequelize } from "./config/database.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import userRouter from "./route/authRoutes.js";
import roomRouter from "./route/roomRoutes.js";
import gameRouter from "./route/gameRoutes.js";
import tournamentRouter from "./route/tournamentRoutes.js";
import walletRouter from "./route/walletRoutes.js";
//import paymentRouter from "./route/payment.route.js";
import adminRouter from "./route/admin.route.js";
dotenv.config({
  path: "./.env",
});
const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(bodyParser.json());
app.use(express.json({ limit: "16kb" }));

app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
sequelize.authenticate();
//user touter
app.use("/user", userRouter);
//game router
app.use("/game", gameRouter);
//room router
app.use("/room", roomRouter);
//tournament router
app.use("/tournament", tournamentRouter);

//app.use("/payment", paymentRouter);
//transaction router
app.use("/user", walletRouter);
// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ message: "Server error", error: err.message });
});

export { app };
