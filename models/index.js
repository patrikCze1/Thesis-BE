const Sequelize = require("sequelize");
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
  // force: true,
});

const models = [
  require("./project/Project"),
  require("./task/Task.js"),
  require("./task/TaskAttachment.js"),
  require("./task/TaskComment.js"),
  require("./task/TaskCommentAttachment.js"),
  require("./task/TaskChangeLog.js"),
  require("./task/TimeTrack.js"),
  require("./task/SubTask.js"),
  require("./todo/Todo.js"),
  require("./user/User.js"),//PersonalInfo
  require("./user/Group.js"),
  require("./user/UserGroup.js"),
  require("./notification/Notification.js"),
  require("./notification/TaskNotification.js"),
];

//Note, Role

for (const model of models) {
	model(sequelize);
}

// Relations
const {
  Project, 
  Task, 
  TaskAttachment, 
  TaskComment, 
  TaskCommentAttachment, 
  TaskChangeLog, 
  User, 
  Group, 
  Todo, 
  UserGroup, 
  TimeTrack,
  Notification,
  TaskNotification,
  SubTask,
} = sequelize.models;

Project.hasMany(Task, {
  onDelete: 'CASCADE',
  foreignKey: { allowNull: false }
});
Task.belongsTo(Project);
User.hasMany(Project, {foreignKey: 'createdById'});
Project.belongsTo(User, {foreignKey: 'createdById'});

TaskAttachment.belongsTo(Task, {
  onDelete: 'CASCADE',
  foreignKey: { allowNull: false }
});
Task.hasMany(TaskAttachment);
TaskComment.belongsTo(Task, {
  onDelete: 'CASCADE',
  foreignKey: { allowNull: false }
});
Task.hasMany(TaskComment);
TaskComment.hasMany(TaskCommentAttachment);
TaskCommentAttachment.belongsTo(TaskComment);
Task.hasMany(TaskChangeLog);
TaskChangeLog.belongsTo(Task, {
  onDelete: 'CASCADE',
  foreignKey: { allowNull: false }
});
User.hasMany(Task, {foreignKey: 'solverId'});
Task.belongsTo(User, {foreignKey: 'solverId'});
User.hasMany(Task, {foreignKey: 'createdById'});
Task.belongsTo(User, {foreignKey: 'createdById'});

Task.hasMany(SubTask);
SubTask.belongsTo(Task);
User.hasMany(SubTask, {foreignKey: 'solvedById'});
SubTask.belongsTo(User, {foreignKey: 'solvedById'});

User.hasMany(TaskComment);
TaskComment.belongsTo(User);
User.hasMany(TaskChangeLog);
TaskChangeLog.belongsTo(User);

// time track
User.hasMany(TimeTrack);
TimeTrack.belongsTo(User);
Task.hasMany(TimeTrack);
TimeTrack.belongsTo(Task);

//notification
User.hasMany(Notification);
Notification.belongsTo(User);

Notification.hasOne(TaskNotification);
TaskNotification.belongsTo(Notification);
Task.hasMany(TaskNotification);
TaskNotification.belongsTo(Task);
TaskNotification.removeAttribute('id');

User.hasMany(Todo);
Todo.belongsTo(User);

const ProjectGroup = sequelize.define('ProjectGroup', {}, { timestamps: false });
Project.belongsToMany(Group, { through: 'ProjectGroup' });
Group.belongsToMany(Project, { through: 'ProjectGroup' });

// Project.belongsToMany(User, { through: 'ProjectUser' });
// User.belongsToMany(Project, { through: 'ProjectUser' });

User.belongsToMany(Group, {
  through: {
    model: UserGroup,
    unique: false,
    scope: {
      taggable: "user",
    },
  },
  foreignKey: "userId",
});

Group.belongsToMany(User, {
  through: {
    model: UserGroup,
    unique: false,
    scope: {
      taggable: "group",
    },
  },
  foreignKey: "groupId",
  constraints: false,
});

module.exports = sequelize;