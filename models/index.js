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
  force: true,
});

const models = [
  require("./project/Project"),
  require("./project/Task.js"), //TaskAttachment, TaskChecklist
  require("./project/TaskComment.js"),
  require("./todo/Todo.js"),
  require("./project/TaskChangeLog.js"),
  require("./user/User.js"),//PersonalInfo
  require("./user/Group.js"),
  require("./user/UserGroup.js"),
];

//Note, Notification, Role

for (const model of models) {
	model(sequelize);
}

// Relations
const {Project, Task, TaskComment, TaskChangeLog, User, Group, Todo, UserGroup} = sequelize.models;

Project.hasMany(Task);
Task.belongsTo(Project);
Task.hasMany(TaskComment);
TaskComment.belongsTo(Task);
Task.hasMany(TaskChangeLog);
TaskChangeLog.belongsTo(Task);
User.hasMany(Task, {foreignKey: 'SolverId'});
Task.belongsTo(User, {foreignKey: 'SolverId'});

User.hasMany(TaskComment);
TaskComment.belongsTo(User);
User.hasMany(TaskChangeLog);
TaskChangeLog.belongsTo(User);

User.hasMany(Todo);
Todo.belongsTo(User);

const ProjectGroup = sequelize.define('ProjectGroup', {}, { timestamps: false });
Project.belongsToMany(Group, { through: 'ProjectGroup' });
Group.belongsToMany(Project, { through: 'ProjectGroup' });

Project.belongsToMany(User, { through: 'ProjectUser' });
User.belongsToMany(Project, { through: 'ProjectUser' });

User.belongsToMany(Group, {
  through: {
    model: UserGroup,
    unique: false,
    scope: {
      taggable: "user",
    },
  },
  foreignKey: "UserId",
});

Group.belongsToMany(User, {
  through: {
    model: UserGroup,
    unique: false,
    scope: {
      taggable: "group",
    },
  },
  foreignKey: "GroupId",
  constraints: false,
});

module.exports = sequelize;