import { Sequelize } from "sequelize";


const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  dialectOptions: {
    ssl: {
      require: true,             
      rejectUnauthorized: false, 
    },
  },
});

// Test DB connection
const testDbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection successful!");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  }
};

// Call immediately
testDbConnection();

export { sequelize };
