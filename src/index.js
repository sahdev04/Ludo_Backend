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
    app.listen(PORT, () => {
      console.log("your server connected on port ", PORT);
    });
  })
  .catch((err) => {
    console.log(err);
  });
