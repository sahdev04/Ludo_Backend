import dotenv from "dotenv";
import { sequelize } from "./config/database.js";
import { app } from "./app.js";
import http from "http";
import { initializeSocket } from "./config/socket.js";

dotenv.config({ path: "./.env" });

const server = http.createServer(app);
//const PORT = process.env.PORT || 8000;

// Attach WebSocket to server
const io = initializeSocket(server);

(async () => {
  try {
    await sequelize.authenticate();
    //console.log("Database connected successfully!");

    await sequelize.sync();
    //console.log("Database synced!");

    // Start server only after DB is ready
    server.listen(process.env.PORT, () => {
      console.log(` Server running on port ${process.env.PORT}`);
    });
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1); // Stop process if DB fails
  }
})();

export { io };
