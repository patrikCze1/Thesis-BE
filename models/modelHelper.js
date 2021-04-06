const sequelize = require('./index');

module.exports = {
    User: sequelize.models.User,
    Group: sequelize.models.Group,
    UserGroup: sequelize.models.UserGroup,
    Project: sequelize.models.Project,
    Task: sequelize.models.Task,
    TaskComment: sequelize.models.TaskComment,
    TaskChangeLog: sequelize.models.TaskChangeLog,
    Todo: sequelize.models.Todo,
}