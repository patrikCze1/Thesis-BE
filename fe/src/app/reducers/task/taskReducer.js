import axios from "./../../../utils/axios.config";
import { toast } from "react-toastify";
import i18next from "i18next";

const initialState = {
  tasks: [],
  tasksLoaded: false,
  tasksError: false,
  tasksErrorMessage: "",
  task: {},
  taskLoaded: false,
  taskError: false,
  taskErrorMessage: "",
  actionSuccess: false,
  actionProcessing: false,
};

export default function taskReducer(state = initialState, action) {
  switch (action.type) {
    case "tasks/loadStart":
      return { ...state, tasksLoaded: false, tasksError: false };

    case "tasks/loaded":
      return { ...state, tasksLoaded: true, tasks: action.payload.tasks };

    case "tasks/loadFail":
      return { ...state, tasksLoaded: true, tasksError: true };

    case "task/loadStart":
      return {
        ...state,
        task: {},
        taskLoaded: false,
        taskError: true,
        actionSuccess: false,
      };

    case "task/loadFail":
      return { ...state, taskLoaded: false, taskError: true };

    case "task/loaded":
      return {
        ...state,
        task: action.payload.task,
        taskLoaded: true,
        actionSuccess: true,
      };

    case "task/create":
      return {
        ...state,
        actionSuccess: true,
        actionProcessing: false,
        task: action.payload.task,
        taskLoaded: true,
        tasks: [...state.tasks, action.payload.task],
      };

    case "task/socketNew":
      if (!state.tasks.some((task) => task.id == action.payload.id)) {
        return {
          ...state,
          tasks: [...state.tasks, action.payload],
        };
      } else return state;

    case "task/edit":
      return {
        ...state,
        actionSuccess: true,
        actionProcessing: false,
        tasks: state.tasks.map((task) => {
          if (task.id === action.payload.task.id) return action.payload.task;
          else return task;
        }),
      };

    case "task/socketEdit":
      return {
        ...state,
        tasks: state.tasks.map((task) => {
          if (task.id === action.payload.id) return action.payload;
          else return task;
        }),
        task:
          state.task.id === action.payload.id
            ? { ...state.task, ...action.payload }
            : state.task,
      };

    case "task/complete":
      return {
        ...state,
        tasks: state.tasks.map((task) => {
          if (task.id === action.payload.id)
            return { ...task, ...action.payload };
          else return task;
        }),
        task:
          state.task.id === action.payload.id
            ? { ...state.task, ...action.payload }
            : state.task,
      };

    case "task/delete":
      return {
        ...state,
        task: {},
        actionSuccess: true,
        actionProcessing: false,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      };

    case "task/socketDelete":
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      };

    case "task/actionStart":
      return { ...state, actionSuccess: false, actionProcessing: true };

    case "task/actionFail":
      return { ...state, actionSuccess: false, actionProcessing: false };

    case "task/changeCommentsCount":
      return {
        ...state,
        tasks: state.tasks.map((task) => {
          if (task.id === action.payload.taskId)
            task.commentsCount += action.payload.value;
          return task;
        }),
      };

    default:
      return state;
  }
}

export const loadTasksAction =
  (projectId, params = "") =>
  async (dispatch) => {
    dispatch({ type: "tasks/loadStart", payload: null });
    try {
      const response = await axios.get(
        `/api/projects/${projectId}/tasks/${params}`
      );
      dispatch({ type: "tasks/loaded", payload: response.data });
    } catch (error) {
      toast.error(error.response?.data?.message);
      dispatch({ type: "tasks/loadFail", payload: null });
    }
  };

export const loadTaskDetailAction = (projectId, taskId) => async (dispatch) => {
  dispatch({ type: "task/loadStart", payload: null });
  try {
    const response = await axios.get(
      `/api/projects/${projectId}/tasks/${taskId}`
    );
    dispatch({ type: "task/loaded", payload: response.data });
  } catch (error) {
    toast.error(error.response?.data?.message);
    dispatch({ type: "task/loadFail", payload: null });
  }
};

export const createTaskAction = (projectId, data) => async (dispatch) => {
  dispatch({ type: "task/actionStart", payload: null });
  console.log("task", data);
  try {
    const response = await axios.post(
      `/api/projects/${projectId}/tasks/`,
      data
    );
    dispatch({ type: "task/create", payload: response.data });
  } catch (error) {
    toast.error(error.response?.data?.message);
    dispatch({ type: "task/actionFail", payload: null });
  }
};

export const socketNewTask = (task) => (dispatch) => {
  console.log("socketNewTask task", task);
  dispatch({ type: "task/socketNew", payload: task });
};

export const editTaskAction = (projectId, taskId, data) => async (dispatch) => {
  dispatch({ type: "task/actionStart", payload: null });
  console.log("editTaskAction", data);
  try {
    const response = await axios.patch(
      `/api/projects/${projectId}/tasks/${taskId}`,
      data
    );
    dispatch({ type: "task/edit", payload: response.data });
    toast.success(i18next.t("project.changesSaved"));
  } catch (error) {
    toast.error(error.response?.data?.message);
    dispatch({ type: "task/actionFail", payload: null });
  }
};

export const socketEditTask = (task) => (dispatch) => {
  dispatch({ type: "task/socketEdit", payload: task });
};

export const completeTaskAction = (projectId, taskId) => async (dispatch) => {
  dispatch({ type: "task/actionStart", payload: null });

  try {
    const response = await axios.patch(
      `/api/projects/${projectId}/tasks/${taskId}/complete`
    );
    dispatch({ type: "task/complete", payload: response.data.task });
    toast.success(i18next.t("project.changesSaved"));
  } catch (error) {
    toast.error(error.response?.data?.message);
    dispatch({ type: "task/actionFail", payload: null });
  }
};

export const deleteTaskAction = (projectId, taskId) => async (dispatch) => {
  dispatch({ type: "task/actionStart", payload: null });
  try {
    const response = await axios.delete(
      `/api/projects/${projectId}/tasks/${taskId}`
    );
    dispatch({ type: "task/delete", payload: taskId });
    toast.success(i18next.t("task.taskDeleted"));
  } catch (error) {
    toast.error(error.response?.data?.message);
    dispatch({ type: "task/actionFail", payload: null });
  }
};

export const socketDeleteTask = (id) => (dispatch) => {
  dispatch({ type: "task/socketDelete", payload: id });
};
