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
  PROJECT_BOARD_NEW: "PROJECT_BOARD_NEW",
  BOARD_STAGE_NEW: "BOARD_STAGE_NEW",
  BOARD_STAGE_EDIT: "BOARD_STAGE_EDIT",
  BOARD_STAGE_DELETE: "BOARD_STAGE_DELETE",
  TASK_COMMENT_NEW: "TASK_COMMENT_NEW",
  TASK_COMMENT_EDIT: "TASK_COMMENT_EDIT",
  TASK_COMMENT_DELETE: "TASK_COMMENT_DELETE",
  TIME_TRACK_STOP: "TIME_TRACK_STOP",
});

export const ROLES = Object.freeze({
  USER: "user",
  MANAGEMENT: "management",
  ADMIN: "admin",
});

export const ROUTE = Object.freeze({
  HOME: "/",
  LOGIN: "/prihlasit",
  SEARCH: "/hledat",
  PROJECTS: "/projekty",
  PROJECTS_DETAIL: "/projekty/:id",
  PROJECTS_DETAIL_ARCHIVE: "/projekty/:id/archiv",
  PROJECTS_DETAIL_BACKLOG: "/projekty/:id/nevyrizene",
  PROJECTS_BOARDS: "/projekty/:id/nastenky",
  PROJECTS_BOARDS_DETAIL: "/projekty/:id/nastenky/:boardId",
  PROJECTS_NEW: "/projekty/novy",
  USER_PROFIL: "/profil",
  NOTIFICATIONS: "/oznameni",
  FORGOTTEN_PASSWORD: "/zapomenute-heslo",
  RESET_PASSWORD: "/obnovit-heslo",
  TIME_TRACKS: "/zaznam-casu",
  TIME_TRACKS_REPORT: "/zaznam-casu/report",
  TODO: "/moje-todo",
  NOT_FOUND: "/nenalezeno",
  ADMIN_CLIENT: "/administrace/klienti",
  ADMIN_GROUP: "/administrace/skupiny",
  ADMIN_USER: "/administrace/uzivatele",
  ADMIN: "/administrace",
});

export const TASK_COLORS = Object.freeze([
  "#B80000",
  "#f26b11",
  "#FCCB00",
  "#008B02",
  "#004DCF",
  "#e81ce1",
  "#fff",
]);

export const TASK_PRIORITY = Object.freeze({
  1: "priority.low",
  2: "priority.medium",
  3: "priority.high",
  4: "priority.urgent",
  5: "priority.critical",
});

export const STAGE_TYPE = Object.freeze({
  WAITING: 1,
  IN_PROGRESS: 3,
  COMPLETED: 5,
});

export const TASK_ACTION_TYPE = Object.freeze({
  NORMAL: "NORMAL",
  BACKLOG: "BACKLOG",
  ARCHIVE: "ARCHIVE",
});
