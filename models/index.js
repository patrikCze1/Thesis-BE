const Sequelize = require("sequelize");
const { DataTypes, Model } = require("sequelize");
require("dotenv/config");

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
//   force: true,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

const Project = require("./project/Project.js") (sequelize, DataTypes);
const Task = require("./project/Task.js") (sequelize, DataTypes, Model); //TaskAttachment, TaskChecklist

const TaskComment = require("./project/TaskComment.js") (sequelize, DataTypes);
const TaskChangeLog = require("./project/TaskChangeLog.js") (sequelize, DataTypes);

const User = require("./user/User.js") (sequelize, DataTypes, Model); //PersonalInfo
const Group = require("./user/Group.js") (sequelize, DataTypes);
const UserGroup = require("./user/UserGroup.js") (sequelize, DataTypes);

//Todo, Note, Notification

// Relations

Project.hasMany(Task);
Task.belongsTo(Project);
Task.hasMany(TaskComment);
TaskComment.belongsTo(Task);
Task.hasMany(TaskChangeLog);
TaskChangeLog.belongsTo(Task);

User.hasMany(TaskComment);
TaskComment.belongsTo(User);
User.hasMany(TaskChangeLog);
TaskChangeLog.belongsTo(User);

User.belongsToMany(Group, {
  through: {
    model: UserGroup,
    unique: false,
    scope: {
      taggable: "user",
    },
  },
  foreignKey: "user_id",
});

Group.belongsToMany(User, {
  through: {
    model: UserGroup,
    unique: false,
  },
  foreignKey: "group_id",
  constraints: false,
});

// sequelize.sync({ force: true });

db.Project = Project;
db.Task = Task;
db.User = User;
db.Group = Group;
db.TaskComment = TaskComment;
db.TaskChangeLog = TaskChangeLog;

module.exports = db;