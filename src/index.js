import dotenv from "dotenv";
import { sequelize } from "./DB/db.user.js";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});

const PORT = 7000;
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected successfully!");
    return sequelize.sync();
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log("Server is running on port", PORT);
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });
