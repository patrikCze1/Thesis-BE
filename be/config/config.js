const Sequelize = require("sequelize");

const connections = {};

//will add new connection to db connections
const createSequelizeConnection = (key, connString) => {
  if (!(key in connections)) {
    const connection = new Sequelize(connString, {
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
    });
    connections[key] = connection;
  }
};

const sequelizeAdmin = new Sequelize(process.env.DB_CONNECTION_ADMIN, {
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
});

module.exports = { createSequelizeConnection, connections, sequelizeAdmin };
