import axios from "./../../../utils/axios.config";
import { toast } from "react-toastify";
import i18n from "../../../i18n";

const initialState = {
  todos: [],
  loaded: false,
};

export default function myTodoReducer(state = initialState, action) {
  switch (action.type) {
    case "todos/load":
      return { ...state, loaded: false };

    case "todos/loaded":
      return { ...state, loaded: true, todos: action.payload.todos };

    case "todos/created":
      return { ...state, todos: [...state.todos, action.payload.todo] };

    case "todos/edited":
      return {
        ...state,
        // todos: state.todos.map((todo) => {
        //   if (todo.id === action.payload.todo.id) return action.payload.todo;
        //   else return todo;
        // }),
      };

    case "todos/delete":
      return {
        ...state,
        todos: state.todos.filter((todo) => todo.id !== action.payload),
      };

    default:
      return state;
  }
}

export const loadTodosAction = () => async (dispatch) => {
  dispatch({ type: "todos/load", payload: null });
  try {
    const response = await axios.get(`/api/todos/`, {
      withCredentials: true,
    });
    dispatch({ type: "todos/loaded", payload: response.data });
  } catch (error) {
    toast.error(error.response?.data?.message);
  }
};

export const createTodoAction = (name) => async (dispatch) => {
  try {
    const res = await axios.post(`/api/todos/`, {
      name,
    });
    dispatch({ type: "todos/created", payload: res.data });
  } catch (error) {
    toast.error(error.response?.data?.message);
  }
};

export const editTodoAction = (id, todo) => async (dispatch) => {
  try {
    const res = await axios.patch(`/api/todos/${id}`, {
      ...todo,
      withCredentials: true,
    });
    dispatch({ type: "todos/edited", payload: res.data });
  } catch (error) {
    toast.error(error.response?.data?.message);
  }
};

export const deleteTodoAction = (id) => async (dispatch) => {
  const toastId = toast(i18n.t("message.removingRecord"), {
    autoClose: false,
    closeButton: false,
  });

  try {
    await axios.delete(`/api/todos/${id}`);
    dispatch({ type: "todos/delete", payload: id });
    toast.update(toastId, {
      render: i18n.t("message.recordRemoved"),
      type: "success",
      autoClose: true,
    });
  } catch (error) {
    toast.update(toastId, {
      render: error.response?.data?.message,
      type: "error",
      autoClose: true,
    });
  }
};
