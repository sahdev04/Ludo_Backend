import { Sequelize } from "sequelize";

const sequelize = new Sequelize("ludouser", "postgres", "root", {
  host: "localhost",
  dialect: "postgres",
});

async () => {
  try {
    await sequelize.authenticate();
    console.log("database connection success !");
  } catch (error) {
    console.log("error : ", error);
  }
};

export { sequelize };
