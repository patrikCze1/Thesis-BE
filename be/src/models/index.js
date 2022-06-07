const { associateConnectionWithModels } = require("../service/db");
const sequelize = require("./../../config/config");
const models = require("./models");

associateConnectionWithModels(models, sequelize);

(module.exports = sequelize), models;
