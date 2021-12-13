export const PROJECT_STATE = Object.freeze({
  1: "project.state.planned",
  5: "project.state.active",
  10: "project.state.completed",
  20: "project.state.cancelled",
});

export const SOCKET = Object.freeze({
  NOTIFICATION_NEW: "NOTIFICATION_NEW",
  TASK_NEW: "TASK_NEW",
  TASK_EDIT: "TASK_EDIT",
  TASK_DELETE: "TASK_DELETE",
  PROJECT_NEW: "PROJECT_NEW",
  PROJECT_EDIT: "PROJECT_EDIT",
  PROJECT_DELETE: "PROJECT_DELETE",
  PROJECT_STAGE_NEW: "PROJECT_STAGE_NEW",
  PROJECT_STAGE_EDIT: "PROJECT_STAGE_EDIT",
  PROJECT_STAGE_DELETE: "PROJECT_STAGE_DELETE",
  TASK_COMMENT_NEW: "TASK_COMMENT_NEW",
  TASK_COMMENT_EDIT: "TASK_COMMENT_EDIT",
  TASK_COMMENT_DELETE: "TASK_COMMENT_DELETE",
});

export const ROLES = Object.freeze({
  USER: "user",
  MANAGEMENT: "management",
  ADMIN: "admin",
});
