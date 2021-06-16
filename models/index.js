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

// const models = [
//   User: require("./user/User.js"),
//   Group: require("./user/Group.js"),
//   UserGroup: require("./user/UserGroup.js"),
//   Client: require("./project/Client"),
//   Project: require("./project/Project"),
//   Task: require("./task/Task.js"),
//   TaskAttachment: require("./task/TaskAttachment.js"),
//   TaskComment: require("./task/TaskComment.js"),
//   TaskCommentAttachment: require("./task/TaskCommentAttachment.js"),
//   TaskChangeLog: require("./task/TaskChangeLog.js"),
//   TaskCheck: require("./task/TaskCheck.js"),
//   TimeTrack: require("./task/TimeTrack.js"),
//   Todo: require("./todo/Todo.js"),
//   Notification: require("./notification/Notification.js"),
//   TaskNotification: require("./notification/TaskNotification.js"),
// ];
const models = [
  require("./user/User.js"),
  require("./user/Group.js"),
  require("./user/UserGroup.js"),
  require("./user/relation/ProjectUser"),
  require("./project/Client"),
  require("./project/Project"),
  require("./project/ProjectGroup"),
  require("./task/Task.js"),
  require("./task/TaskAttachment.js"),
  require("./task/TaskComment.js"),
  require("./task/TaskCommentAttachment.js"),
  require("./task/TaskChangeLog.js"),
  require("./task/TaskCheck.js"),
  require("./task/TimeTrack.js"),
  require("./todo/Todo.js"),
  require("./notification/Notification.js"),
  require("./notification/TaskNotification.js"),
];

//Note, Role, Stage (kaban)
for (const model of models) {
  model(sequelize);
}

Object.keys(sequelize.models).forEach(key => {
	if (sequelize.models[key].hasOwnProperty('associate')) {
		sequelize.models[key].associate(sequelize.models);
	}
});


// Client.hasMany(Project, {
//   onDelete: 'CASCADE',
//   foreignKey: 'clientId',
// });
// Project.belongsTo(Client, {foreignKey: 'clientId'});
// Project.hasMany(Task, {
//   onDelete: 'CASCADE',
//   foreignKey: { allowNull: false }
// });
// Task.belongsTo(Project);
// User.hasMany(Project, {foreignKey: 'createdById'});
// Project.belongsTo(User, {foreignKey: 'createdById'});
// Task.hasMany(Task, {
//   onDelete: 'CASCADE', 
//   foreignKey: 'parent', 
//   as: 'subTask'
// });

// TaskAttachment.belongsTo(Task, {
//   onDelete: 'CASCADE',
//   foreignKey: { allowNull: false }
// });
// Task.hasMany(TaskAttachment);
// TaskComment.belongsTo(Task, {
//   onDelete: 'CASCADE',
//   foreignKey: 'taskId',
// });
// Task.hasMany(TaskComment);
// TaskComment.hasMany(TaskCommentAttachment);
// TaskCommentAttachment.belongsTo(TaskComment);
// Task.hasMany(TaskChangeLog);
// TaskChangeLog.belongsTo(Task, {
//   onDelete: 'CASCADE',
//   foreignKey: 'taskId',
// });
// Task.hasMany(TaskCheck);
// TaskCheck.belongsTo(Task, {foreignKey: 'taskId', as: 'task'});
// User.hasMany(Task, {foreignKey: 'solverId'});
// Task.belongsTo(User, {foreignKey: 'solverId', as: 'solver'});
// User.hasMany(Task, {foreignKey: 'createdById'});
// Task.belongsTo(User, {foreignKey: 'createdById', as: 'user'});
// User.hasMany(TaskCheck, {foreignKey: 'solverId'});
// TaskCheck.belongsTo(User, {foreignKey: 'solverId', as: 'solver'});

// User.hasMany(TaskComment);
// TaskComment.belongsTo(User, {foreignKey: 'userId', as: 'user'});
// User.hasMany(TaskChangeLog);
// TaskChangeLog.belongsTo(User, {foreignKey: 'userId', as: 'user'});

// time track
// User.hasMany(TimeTrack);
// TimeTrack.belongsTo(User, {as: 'user'});
// Task.hasMany(TimeTrack);
// TimeTrack.belongsTo(Task, {as: 'task'});

//notification
// User.hasMany(Notification);
// Notification.belongsTo(User, {as: 'user'});

// Notification.hasOne(TaskNotification);
// TaskNotification.belongsTo(Notification, {as: 'notification'});
// Task.hasMany(TaskNotification);
// TaskNotification.belongsTo(Task, {as: 'task'});
// TaskNotification.removeAttribute('id');

// User.hasMany(Todo);
// Todo.belongsTo(User, {as: 'user'});

// Project.belongsToMany(User, { through: 'ProjectUser' });
// User.belongsToMany(Project, { through: 'ProjectUser' });

// User.belongsToMany(Group, {
//   through: {
//     model: UserGroup,
//     unique: false,
//     scope: {
//       taggable: "user",
//     },
//   },
//   foreignKey: "userId",
// });

// Group.belongsToMany(User, {
//   through: {
//     model: UserGroup,
//     unique: false,
//     scope: {
//       taggable: "group",
//     },
//   },
//   foreignKey: "groupId",
//   constraints: false,
// });

module.exports = sequelize;