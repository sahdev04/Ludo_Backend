import { Sequelize } from "sequelize";

// Initialize Sequelize connection
const sequelize = new Sequelize("ludogame", "postgres", "root", {
  host: "localhost",
  dialect: "postgres",
});

//  Correct way to test the connection
const testDbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection successful!");
  } catch (error) {
    console.error(" Database connection failed:", error.message);
  }
};

// Call the function immediately
testDbConnection();

export { sequelize };
