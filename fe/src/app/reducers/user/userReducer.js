import axios from "./../../../utils/axios.config";
import { toast } from "react-toastify";
import i18next from "i18next";
import i18n from "../../../i18n";

const initialState = {
  users: [],
  usersLoaded: false,
  user: {},
  userLoading: false,
  processing: false,
};

export default function userReducer(state = initialState, action) {
  switch (action.type) {
    case "users/loadStart":
      return { ...state, usersLoaded: false };

    case "users/loaded":
      return { ...state, usersLoaded: true, users: action.payload.users };

    case "user/loadStart":
      return { ...state, userLoading: true, user: {}, error: null };

    case "user/clear":
      return { ...state, user: {}, error: null };

    case "user/loaded":
      return { ...state, userLoading: false, user: action.payload.user };

    case "user/create":
      return {
        ...state,
        processing: false,
        error: null,
        user: action.payload.user,
        users: [action.payload.user, ...state.users],
      };

    case "user/edit":
      return {
        ...state,
        processing: false,
        error: null,
        user: action.payload.user,
        users: state.users.map((user) => {
          if (user.id == action.payload.user.id) return action.payload.user;
          else return user;
        }),
      };

    case "user/delete":
      return {
        ...state,
        error: null,
        users: state.users.filter((user) => user.id !== action.payload),
      };

    case "user/actionStart":
      return {
        ...state,
        processing: true,
      };

    case "user/actionStop":
      return {
        ...state,
        processing: false,
      };

    default:
      return state;
  }
}

export const loadUsersAction =
  (params = "") =>
  async (dispatch) => {
    dispatch({ type: "users/loadStart", payload: null });
    try {
      const response = await axios.get(`/api/users${params}`);
      dispatch({ type: "users/loaded", payload: response.data });
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

/**
 *
 * @param {number} projectId
 * @returns
 */
export const loadUsersByProject = (projectId) => async (dispatch) => {
  dispatch({ type: "users/loadStart", payload: null });
  try {
    const response = await axios.get(`/api/users/project/${projectId}`);
    console.log(response);
    dispatch({ type: "users/loaded", payload: response.data });
  } catch (error) {
    toast.error(error.response?.data?.message);
  }
};

/**
 *
 * @param {number} id
 * @returns
 */
export const loadUserDetailAction = (id) => async (dispatch) => {
  dispatch({ type: "user/loadStart", payload: null });
  try {
    const response = await axios.get(`/api/users/${id}`);
    dispatch({ type: "user/loaded", payload: response.data });
  } catch (error) {
    toast.error(error.response?.data?.message);
  }
};

export const clearUserDetailAction = () => async (dispatch) => {
  dispatch({ type: "user/clear", payload: null });
};

/**
 *
 * @param {object} user
 * @returns
 */
export const createUserAction = (user) => async (dispatch) => {
  dispatch({ type: "user/actionStart", payload: null });
  try {
    const response = await axios.post(`/api/users`, user);
    toast.success(i18next.t("User created"));
    dispatch({ type: "user/create", payload: response.data });
  } catch (error) {
    toast.error(error.response?.data?.message);
    dispatch({ type: "user/actionStop", payload: null });
  }
};

/**
 *
 * @param {number} id
 * @param {object} data
 * @returns
 */
export const editUserAction = (id, data) => async (dispatch) => {
  let deactivating = false;
  let toastId = null;
  if ("deactivated" in data && Object.keys(data).length === 1) {
    deactivating = true;
    toastId = toast(
      data.deactivated
        ? i18n.t("message.deactivatingUser")
        : i18n.t("message.activatingUser"),
      {
        autoClose: false,
        closeButton: false,
      }
    );
  }
  dispatch({ type: "user/actionStart", payload: null });
  try {
    const response = await axios.patch(`/api/users/${id}`, data);
    if (!deactivating) toast.success(i18n.t("User updated"));
    else
      toast.update(toastId, {
        render: data.deactivated
          ? i18n.t("user.message.deactivated")
          : i18n.t("user.message.activated"),
        type: "success",
        autoClose: true,
      });
    dispatch({ type: "user/edit", payload: response.data });
  } catch (error) {
    if (!deactivating) toast.error(error.response?.data?.message);
    else
      toast.update(toastId, {
        render: error.response?.data?.message,
        type: "error",
        autoClose: true,
      });
    dispatch({ type: "user/actionStop", payload: null });
  }
};

export const deleteUserAction = (id) => async (dispatch) => {
  const toastId = toast(i18n.t("message.removingUser"), {
    autoClose: false,
    closeButton: false,
  });
  try {
    await axios.delete(`/api/users/${id}`);

    dispatch({ type: "user/delete", payload: id });
    toast.update(toastId, {
      render: i18next.t("user.message.deleted"),
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
