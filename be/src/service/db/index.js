const mysql = require("mysql2/promise");
const { Sequelize } = require("sequelize");

const models = require("../../models/models");
const config = require("./../../../config/config.json");

/**
 * Create new db, sync connection with models and create first user
 *
 * @param {string} name
 * @param {User} user
 * @returns
 */
async function createDB(name, user) {
  //TODO
  const { host, port, username, password, database, dialect } =
    config.development;

  // Open the connection to MySQL server
  const connection = await mysql.createConnection({
    host,
    user: username,
    password,
    port,
  });

  // Run create database statement
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`jago_${name}\`;`);

  const connString = `${process.env.DB_CONNECTION}jago_${name}`;
  //connect to db
  const sequelize = new Sequelize(connString);

  // init models and add them to the exported db object
  associateConnectionWithModels(models, sequelize);

  // sync all models with database
  await sequelize.sync();

  await sequelize.models.User.create(user);

  // Close the connection
  connection.end();

  return { sequelize, connString };
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
