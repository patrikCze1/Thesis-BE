const mysql = require("mysql2/promise");
const { Sequelize } = require("sequelize");

const models = require("../../models/models");
const config = require("./../../../config/config.json");

async function createDB(name) {
  //TODO
  const { host, port, username, password, database, dialect } =
    config.development;
  const db = {};

  // Open the connection to MySQL server
  const connection = await mysql.createConnection({
    host,
    user: username,
    password,
    port: 8889,
  });

  // Run create database statement
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${name}\`;`);

  //connect to db
  const sequelize = new Sequelize(`mysql://root:root@localhost:8889/${name}`);

  // init models and add them to the exported db object
  associateConnectionWithModels(models, sequelize);

  // sync all models with database
  await sequelize.sync();

  // Close the connection
  connection.end();

  return db;
}

function associateConnectionWithModels(models, sequelize) {
  // const db = {};
  // db.User = require("../users/user.model")(sequelize);

  for (const model of models) {
    model(sequelize);
  }

  Object.keys(sequelize.models).forEach((key) => {
    /* eslint-disable no-prototype-builtins*/
    if (sequelize.models[key].hasOwnProperty("associate")) {
      sequelize.models[key].associate(sequelize.models);
    }
  });

  // return db;
}

module.exports = { createDB, associateConnectionWithModels };
