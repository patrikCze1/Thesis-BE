const { associateConnectionWithModels } = require("../service/db");
const { sequelize, sequelizeAdmin } = require("./../../config/config");
const models = require("./models");
const CompanyModel = require("./admin/Company.model");

associateConnectionWithModels(models, sequelize);
associateConnectionWithModels([CompanyModel], sequelizeAdmin);

(module.exports = { sequelize, sequelizeAdmin }), models;
