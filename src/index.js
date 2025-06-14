import dotenv from "dotenv";
import { sequelize } from "./config/database.js";
import { app } from "./app.js";
import http from "http";
import { initializeSocket } from "./config/socket.js";
import "./cron/statusUpdate.js";

dotenv.config({ path: "./.env" });
const PORT = process.env.PORT || 8000;
const server = http.createServer(app);
// Attach WebSocket to server
const io = initializeSocket(server);

(async () => {
  try {
    await sequelize.authenticate();
    // console.log("Database connected successfully!");

    await sequelize.sync(); // Sync models with the database
    //console.log("Database synced!");

    // Start server only after DB is ready
    server.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1); // Stop process if DB fails
  }
})();

export { io };
