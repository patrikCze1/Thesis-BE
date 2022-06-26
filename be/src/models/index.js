const { associateConnectionWithModels } = require("../service/db");
const {
  sequelizeAdmin,
  connections,
  createSequelizeConnection,
} = require("./../../config/config");
const models = require("./models");
const CompanyModel = require("./admin/Company.model");

const initConnections = async () => {
  console.log("initConnections");
  associateConnectionWithModels([CompanyModel], sequelizeAdmin);
  sequelizeAdmin.sync();

  try {
    const companies = await sequelizeAdmin.models.Company.findAll();
    console.log("companies", companies);

    for (const company of companies) {
      createSequelizeConnection(company.key, company.connectionString);
    }

    for (const key in connections) {
      associateConnectionWithModels(models, connections[key]);
      connections[key].sync();
    }
  } catch (error) {
    console.error("CRITICAL ERROR ", error);
  }

  // console.log("connections", connections);
};

/**
 *
 * @param {Sequelize} connection instance of connection
 */
const syncDbConnection = (connection) => {
  associateConnectionWithModels(models, connection);
  connection.sync();
};

const getDatabaseModels = (key) => {
  if (!(key in connections)) throw new Error("Společnost neexistuje");

  return connections[key].models;
};

const getDatabaseConnection = (key) => {
  console.log("getDatabaseConnection", connections[key]);
  return connections[key];
};

(module.exports = {
  connections,
  sequelizeAdmin,
  initConnections,
  syncDbConnection,
  getDatabaseModels,
  getDatabaseConnection,
}),
  models;
