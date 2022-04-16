const sequelize = require("./../config/config");

const models = [
  require("./user/User"),
  require("./user/Group"),
  require("./user/relation/UserGroup"),
  require("./user/relation/ProjectUser"),
  require("./project/Client"),
  require("./project/Project"),
  require("./project/Board"),
  require("./project/ProjectGroup"),
  require("./project/Stage"),
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

for (const model of models) {
  model(sequelize);
}

Object.keys(sequelize.models).forEach((key) => {
  if (sequelize.models[key].hasOwnProperty("associate")) {
    sequelize.models[key].associate(sequelize.models);
  }
});

module.exports = sequelize;
