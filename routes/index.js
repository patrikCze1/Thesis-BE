module.exports = {
  projectRoutes: require("./project/project.routes"),
  projectStageRoutes: require("./project/stage.routes"),
  taskRoutes: require("./task/task.routes.js"),
  taskAttachmentRoutes: require("./task/taskAttachmentRoutes.js"),
  taskChangeLogRoutes: require("./task/taskChangeLogRoutes.js"),
  taskCommentRoutes: require("./task/taskComment.routes"),
  taskCheckRoutes: require("./task/taskCheckRoutes"),
  timeTrackRoutes: require("./task/timeTrack.routes.js"),
  userRoutes: require("./user/user.routes.js"),
  authRoutes: require("./auth/auth.routes.js"),
  groupRoutes: require("./user/group.routes.js"),
  todoRoutes: require("./todo/todo.routes.js"),
  notificationRoutes: require("./notification/notification.routes.js"),
  clientRoutes: require("./project/client.routes"),
  meRoutes: require("./user/me.routes"),
  searchRoutes: require("./search/search.routes"),
};
