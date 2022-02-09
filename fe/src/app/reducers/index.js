import { combineReducers } from "redux";
import projectReducer from "./project/project.reducer";
import currentUserReducer from "./user/currentUserReducer";
import groupReducer from "./user/groupReducer";
import userReducer from "./user/userReducer";
import clientReducer from "./common/clientReducer";
import taskReducer from "./task/task.reducer";
import taskCheckReducer from "./task/taskCheckReducer";
import taskCommentReducer from "./task/taskCommentReducer";
import taskAttachmentReducer from "./task/taskAttachmentReducer";
import notificationReducer from "./notification/notification.reducer";
import timeTrackReducer from "./timeTrack/timeTrack.reducer";
import todoReducer from "./myTodo/myTodo.reducer";

const reducers = combineReducers({
  projectReducer,
  currentUserReducer,
  clientReducer,
  groupReducer,
  userReducer,
  taskReducer,
  taskCheckReducer,
  taskCommentReducer,
  notificationReducer,
  timeTrackReducer,
  todoReducer,
  taskAttachmentReducer,
});

export default reducers;
