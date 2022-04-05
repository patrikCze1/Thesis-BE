import axios from "../../../utils/axios.config";
import { toast } from "react-toastify";
import i18next from "i18next";
import i18n from "../../../i18n";
import { TASK_ACTION_TYPE } from "../../../utils/enum";

const initialState = {
  tasks: [],
  backlogTasks: [],
  backlogTasksCount: 0,
  archiveTasks: [],
  archiveTasksCount: 0,
  tasksLoaded: false,
  tasksError: false,
  tasksErrorMessage: "",
  task: {},
  taskLoaded: false,
  taskError: false,
  taskErrorMessage: "",
  actionSuccess: false,
  processing: false,
  taskSubtasks: [],
};

export default function taskReducer(state = initialState, action) {
  switch (action.type) {
    case "tasks/loadStart":
      return { ...state, tasksLoaded: false, tasksError: false };

    case "tasks/loaded":
      return { ...state, tasksLoaded: true, tasks: action.payload.rows };

    case "tasks/archiveLoaded":
      return {
        ...state,
        tasksLoaded: true,
        archiveTasks: action.payload.rows,
        archiveTasksCount: action.payload.count,
      };

    case "tasks/backlogTasksLoaded":
      return {
        ...state,
        tasksLoaded: true,
        backlogTasks: action.payload.rows,
        backlogTasksCount: action.payload.count,
      };

    case "tasks/loadFail":
      return { ...state, tasksLoaded: true, tasksError: true };

    case "task/loadStart":
      return {
        ...state,
        task: {},
        taskLoaded: false,
        taskError: true,
        actionSuccess: false,
        taskSubtasks: [],
      };

    case "task/loadFail":
      return { ...state, taskLoaded: false, taskError: true };

    case "task/loaded":
      return {
        ...state,
        task: action.payload.task,
        taskLoaded: true,
        actionSuccess: true,
        taskSubtasks: action.payload.task?.subtasks || [],
      };

    case "task/create":
      const isSubtask = action.payload.task.parentId === state.task.id;
      if (action.payload.task.stageId)
        return {
          ...state,
          actionSuccess: true,
          processing: false,
          taskLoaded: true,
          tasks: [...state.tasks, action.payload.task],
          taskCount: state.taskCount + 1,
          taskSubtasks: isSubtask
            ? [...state.taskSubtasks, action.payload.task]
            : state.taskSubtasks,
        };
      else
        return {
          ...state,
          actionSuccess: true,
          processing: false,
          taskLoaded: true,
          backlogTasks: [...state.backlogTasks, action.payload.task],
          backlogTasksCount: state.backlogTasksCount + 1,
          taskSubtasks: isSubtask
            ? [...state.taskSubtasks, action.payload.task]
            : state.taskSubtasks,
        };

    case "task/socketNew":
      if (
        !state.tasks.some((task) => task.id == action.payload.id) &&
        !state.processing
      ) {
        if (action.payload.stageId)
          return {
            ...state,
            tasks: [...state.tasks, action.payload],
            taskCount: state.taskCount + 1,
          };
        else
          return {
            ...state,
            backlogTasks: [...state.backlogTasks, action.payload],
            backlogTasksCount: state.backlogTasksCount + 1,
          };
      } else return state;

    case "task/edit":
      console.log("task/edit", action.payload);
      const editedState = {
        ...state,
        actionSuccess: true,
        processing: false,
      };

      if (action.payload.type === TASK_ACTION_TYPE.NORMAL) {
        if (action.payload.removeFromArr === true)
          editedState.tasks = state.tasks.filter(
            (task) => task.id !== action.payload.task.id
          );
        else
          editedState.tasks = state.tasks.map((task) => {
            if (task.id === action.payload.task.id)
              task = { ...task, ...action.payload.task };
            return task;
          });
      } else if (action.payload.type === TASK_ACTION_TYPE.BACKLOG) {
        if (action.payload.removeFromArr === true)
          editedState.backlogTasks = state.backlogTasks.filter(
            (task) => task.id !== action.payload.task.id
          );
        else
          editedState.backlogTasks = state.backlogTasks.map((task) => {
            if (task.id === action.payload.task.id)
              task = { ...task, ...action.payload.task };
            return task;
          });
      } else if (action.payload.type === TASK_ACTION_TYPE.ARCHIVE) {
        if (action.payload.removeFromArr === true)
          editedState.archiveTasks = state.archiveTasks.filter(
            (task) => task.id !== action.payload.task.id
          );
        else
          editedState.archiveTasks = state.archiveTasks.map((task) => {
            if (task.id === action.payload.task.id)
              task = { ...task, ...action.payload.task };
            return task;
          });
      }

      return editedState;

    case "task/socketEdit":
      if (state.tasks.some((task) => task.id === action.payload.id))
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
      else if (
        state.backlogTasks.some((task) => task.id === action.payload.id)
      ) {
        return {
          ...state,
          backlogTasks: state.backlogTasks.map((task) => {
            if (task.id === action.payload.id) return action.payload;
            else return task;
          }),
          task:
            state.task.id === action.payload.id
              ? { ...state.task, ...action.payload }
              : state.task,
        };
      } else {
        return {
          ...state,
          archiveTasks: state.archiveTasks.map((task) => {
            if (task.id === action.payload.id) return action.payload;
            else return task;
          }),
          task:
            state.task.id === action.payload.id
              ? { ...state.task, ...action.payload }
              : state.task,
        };
      }

    case "task/delete":
      if (action.payload.type === TASK_ACTION_TYPE.NORMAL)
        return {
          ...state,
          task: {},
          actionSuccess: true,
          processing: false,
          tasks: state.tasks.filter(
            (task) => task.id !== action.payload.taskId
          ),
        };
      else if (action.payload.type === TASK_ACTION_TYPE.BACKLOG)
        return {
          ...state,
          task: {},
          actionSuccess: true,
          processing: false,
          backlogTasks: state.backlogTasks.filter(
            (task) => task.id !== action.payload.taskId
          ),
          backlogTasksCount: state.backlogTasksCount - 1,
        };
      else
        return {
          ...state,
          task: {},
          actionSuccess: true,
          processing: false,
          archiveTasks: state.archiveTasks.filter(
            (task) => task.id !== action.payload.taskId
          ),
          archiveTasksCount: state.archiveTasksCount - 1,
        };

    case "task/socketDelete":
      if (
        (action.payload.type === "rmFromKanban" ||
          action.payload.type === "rmFromAll") &&
        state.tasks.some((task) => task.id === action.payload.id)
      )
        return {
          ...state,
          tasks: state.tasks.filter((task) => task.id !== action.payload.id),
        };
      else if (
        (action.payload.type === "rmFromBacklog" ||
          action.payload.type === "rmFromAll") &&
        state.backlogTasks.some((task) => task.id === action.payload.id)
      )
        return {
          ...state,
          backlogTasks: state.backlogTasks.filter(
            (task) => task.id !== action.payload.id
          ),
          backlogTasksCount: state.backlogTasksCount - 1,
        };
      else if (state.archiveTasks.some((task) => task.id === action.payload.id))
        return {
          ...state,
          archiveTasks: state.archiveTasks.filter(
            (task) => task.id !== action.payload.id
          ),
          archiveTasksCount: state.archiveTasksCount - 1,
        };
      else return { ...state };

    case "task/actionStart":
      return { ...state, actionSuccess: false, processing: true };

    case "task/actionFail":
      return { ...state, actionSuccess: false, processing: false };

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

export const loadArchiveTasksAction =
  (projectId, params = "") =>
  async (dispatch) => {
    dispatch({ type: "tasks/loadStart", payload: null });
    try {
      const response = await axios.get(
        `/api/projects/${projectId}/tasks/${params}`
      );
      dispatch({ type: "tasks/archiveLoaded", payload: response.data });
    } catch (error) {
      toast.error(error.response?.data?.message);
      dispatch({ type: "tasks/loadFail", payload: null });
    }
  };

export const loadBacklogTasksAction =
  (projectId, params = "") =>
  async (dispatch) => {
    dispatch({ type: "tasks/loadStart", payload: null });
    try {
      const response = await axios.get(
        `/api/projects/${projectId}/tasks/${params}`
      );
      dispatch({ type: "tasks/backlogTasksLoaded", payload: response.data });
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
    dispatch({ type: "check/load", payload: response.data.task?.checks });
    dispatch({
      type: "comment/load",
      payload: response.data.task?.taskComments,
    });
    dispatch({
      type: "taskAttachment/set",
      payload: response.data.task?.attachments,
    });
  } catch (error) {
    toast.error(error.response?.data?.message);
    dispatch({ type: "task/loadFail", payload: null });
  }
};

/**
 *
 * @param {number} projectId
 * @param {object} data
 * @returns
 */
export const createTaskAction = (projectId, data) => async (dispatch) => {
  const toastId = toast(
    i18n.t("message.creatingTask", {
      closeButton: false,
      autoClose: false,
    })
  );

  dispatch({ type: "task/actionStart", payload: null });

  try {
    const response = await axios.post(
      `/api/projects/${projectId}/tasks/`,
      data
    );
    toast.update(toastId, {
      render: i18n.t("task.taskCreated"),
      type: "success",
      autoClose: true,
    });

    dispatch({ type: "task/create", payload: response.data });
  } catch (error) {
    toast.update(toastId, {
      render: error.response?.data?.message,
      type: "error",
      autoClose: true,
    });
    dispatch({ type: "task/actionFail", payload: null });
  }
};

export const socketNewTask = (task) => (dispatch) => {
  console.log("socketNewTask task", task);
  dispatch({ type: "task/socketNew", payload: task });
};

/**
 *
 * @param {number} projectId
 * @param {number} taskId
 * @param {object} data
 * @param {boolean} removeFromArr
 */
export const editTaskAction =
  (
    type = TASK_ACTION_TYPE.NORMAL,
    projectId,
    taskId,
    data,
    removeFromArr = false
  ) =>
  async (dispatch) => {
    dispatch({ type: "task/actionStart", payload: null });
    console.log("editTaskAction", data);
    try {
      const response = await axios.patch(
        `/api/projects/${projectId}/tasks/${taskId}`,
        data
      );

      dispatch({
        type: "task/edit",
        payload: { ...response.data, type, removeFromArr },
      });
      toast.success(i18next.t("project.changesSaved"));
    } catch (error) {
      console.error("error message", error.message);
      toast.error(error.response?.data?.message);
      dispatch({ type: "task/actionFail", payload: null });
    }
  };

export const socketEditTask = (task) => (dispatch) => {
  dispatch({ type: "task/socketEdit", payload: task });
};

// export const completeTaskAction = (projectId, taskId) => async (dispatch) => {
//   dispatch({ type: "task/actionStart", payload: null });

//   try {
//     const response = await axios.patch(
//       `/api/projects/${projectId}/tasks/${taskId}/complete`
//     );
//     dispatch({ type: "task/complete", payload: response.data.task });
//     toast.success(i18next.t("project.changesSaved"));
//   } catch (error) {
//     toast.error(error.response?.data?.message);
//     dispatch({ type: "task/actionFail", payload: null });
//   }
// };

export const deleteTaskAction =
  (type = TASK_ACTION_TYPE.NORMAL, projectId, taskId) =>
  async (dispatch) => {
    const toastId = toast(i18n.t("message.removingTask"), {
      autoClose: false,
      closeButton: false,
    });

    try {
      await axios.delete(`/api/projects/${projectId}/tasks/${taskId}`);
      dispatch({ type: "task/delete", payload: { taskId, type } });
      toast.update(toastId, {
        render: i18n.t("task.taskDeleted"),
        type: "success",
        autoClose: true,
      });
    } catch (error) {
      toast.update(toastId, {
        render: error.response?.data?.message,
        type: "error",
        autoClose: true,
      });
      dispatch({ type: "task/actionFail", payload: null });
    }
  };

export const socketDeleteTask = (id, type) => (dispatch) => {
  console.log("socketDeleteTask action");
  dispatch({ type: "task/socketDelete", payload: { id, type } });
};
