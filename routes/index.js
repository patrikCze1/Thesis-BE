module.exports = {
    projectRoutes: require('./project/projectRoutes'),
    taskRoutes: require('./task/taskRoutes.js'),
    taskChangeLogRoutes: require('./task/taskChangeLogRoutes.js'),
    taskCommentRoutes: require('./task/taskCommentRoutes'),
    timeTrackRoutes: require('./task/timeTrackRoutes.js'),
    userRoutes: require('./user/userRoutes.js'),
    authRoutes: require('./auth/authRoutes.js'),
    groupRoutes: require('./user/groupRoutes.js'),
    todoRoutes: require('./todo/todoRoutes.js'),
    notificationRoutes: require('./notification/notificationRoutes.js'),
    clientRoutes: require('./project/clientRoutes'),
    meRoutes: require('./user/meRoutes'),
};