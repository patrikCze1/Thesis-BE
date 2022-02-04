const Sequelize = require("sequelize");

const sequelize = new Sequelize(process.env.DB_CONNECTION, {
  host: "localhost:8889",
  dialect: "mysql",
  operatorsAliases: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  //force: true,
});

const models = [
  require("./user/User"),
  require("./user/Group"),
  require("./user/relation/UserGroup"),
  require("./user/relation/ProjectUser"),
  require("./project/Client"),
  require("./project/Project"),
  require("./project/ProjectGroup"),
  require("./project/ProjectStage"),
  require("./task/Task"),
  require("./task/TaskAttachment"),
  require("./task/TaskComment"),
  require("./task/TaskCommentAttachment"),
  require("./task/TaskChangeLog"),
  require("./task/TaskCheck"),
  require("./time_track/TimeTrack"),
  require("./todo/Todo"),
  require("./notification/Notification"),
  require("./notification/TaskNotification"),
];

//Note, Role, Stage (kaban)
for (const model of models) {
  model(sequelize);
}

Object.keys(sequelize.models).forEach((key) => {
  if (sequelize.models[key].hasOwnProperty("associate")) {
    sequelize.models[key].associate(sequelize.models);
  }
});

module.exports = sequelize;
