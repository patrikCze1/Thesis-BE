const sequelize = require('./index');

module.exports = {
    User: sequelize.models.User,
    Group: sequelize.models.Group,
    UserGroup: sequelize.models.UserGroup,
    Project: sequelize.models.Project,
    Task: sequelize.models.Task,
    TaskAttachment: sequelize.models.TaskAttachment,
    TaskComment: sequelize.models.TaskComment,
    TaskCommentAttachment: sequelize.models.TaskCommentAttachment,
    TaskChangeLog: sequelize.models.TaskChangeLog,
    SubTask: sequelize.models.SubTask,
    Todo: sequelize.models.Todo,
    Notification: sequelize.models.Notification,
    TaskNotification: sequelize.models.TaskNotification,
    TimeTrack: sequelize.models.TimeTrack,
}