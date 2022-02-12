exports.SOCKET_EMIT = Object.freeze({
  TASK_NEW: "TASK_NEW",
  TASK_EDIT: "TASK_EDIT",
  TASK_DELETE: "TASK_DELETE",
  PROJECT_NEW: "PROJECT_NEW",
  PROJECT_EDIT: "PROJECT_EDIT",
  PROJECT_DELETE: "PROJECT_DELETE",
  NOTIFICATION_NEW: "NOTIFICATION_NEW",
  BOARD_STAGE_NEW: "BOARD_STAGE_NEW",
  BOARD_STAGE_EDIT: "BOARD_STAGE_EDIT",
  BOARD_STAGE_DELETE: "BOARD_STAGE_DELETE",
  TASK_COMMENT_NEW: "TASK_COMMENT_NEW",
});

exports.PROJECT_STATE = Object.freeze({
  STATUS_PLANNED: 1,
  STATUS_ACTIVE: 5,
  STATUS_COMPLETED: 10,
  STATUS_CANCELLED: 20,
});

exports.PROJECT_STAGE_TYPE = Object.freeze({
  IN_PROGRESS: 1,
  COMPLETED: 5,
});

exports.NOTIFICATION_TYPE = Object.freeze({
  TYPE_TASK: 1,
  TYPE_TASK_COMMENT: 2,
});

exports.ROLE = Object.freeze({
  ADMIN: "admin",
  USER: "user",
  MANAGEMENT: "management",
});

exports.TASK_PRIORITY = Object.freeze({
  1: "Nízká",
  2: "Střední",
  3: "Vysoká",
  4: "Urgentní",
  5: "Kritická",
});
