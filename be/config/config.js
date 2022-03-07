const Sequelize = require("sequelize");

const sequelize = new Sequelize(process.env.DB_CONNECTION, {
  host: "localhost:8889",
  dialect: "mysql",
  operatorsAliases: false,
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
});

module.exports = sequelize;
