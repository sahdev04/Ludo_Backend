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
// import paymentRouter from "./route/payment.route.js";
import adminRouter from "./route/admin.route.js";

dotenv.config({
  path: "./.env",
});

const app = express();

// ✅ Allowed origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:8081",
  "exp://127.0.0.1:19000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ✅ Middlewares
app.use(express.json({ limit: "16kb" }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// ✅ Session config
app.use(
  session({
    secret: process.env.SESSION_SECRET || "mydefaultsecret", // fallback if env not set
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production" }, // secure only in prod
  })
);

// ✅ Test DB connection
sequelize
  .authenticate()
  .then(() => console.log("✅ Database connected successfully"))
  .catch((err) => console.error("❌ Database connection failed:", err.message));

// ✅ Routes
app.use("/user", userRouter);
app.use("/game", gameRouter);
app.use("/room", roomRouter);
app.use("/tournament", tournamentRouter);
app.use("/user", walletRouter);
// app.use("/payment", paymentRouter);
app.use("/admin", adminRouter);

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ message: "Server error", error: err.message });
});

export { app };
