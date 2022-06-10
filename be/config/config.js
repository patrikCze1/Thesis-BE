const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  process.env.NODE_ENV === "production"
    ? process.env.DB_CONNECTION_PROD
    : process.env.DB_CONNECTION,
  {
    dialect: "mysql",
    operatorsAliases: 0, //false
    define: {
      charset: "utf8mb4",
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    // force: true,
  }
);

const sequelizeAdmin = new Sequelize(
  process.env.NODE_ENV === "production"
    ? process.env.DB_CONNECTION_ADMIN_PROD
    : process.env.DB_CONNECTION_ADMIN,
  {
    dialect: "mysql",
    operatorsAliases: 0, //false
    define: {
      charset: "utf8mb4",
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    force: true,
  }
);

module.exports = { sequelize, sequelizeAdmin };
