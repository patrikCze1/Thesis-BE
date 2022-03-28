import axios from "./../../../utils/axios.config";
import { toast } from "react-toastify";
import i18next from "i18next";

const initialState = {
  users: [],
  usersLoaded: false,
  user: {},
  userLoaded: false,
};

export default function userReducer(state = initialState, action) {
  switch (action.type) {
    case "users/loadStart":
      return { ...state, usersLoaded: false };

    case "users/loaded":
      return { ...state, usersLoaded: true, users: action.payload.users };

    case "user/loadStart":
      return { ...state, userLoaded: false, user: {}, error: null };

    case "user/loaded":
      return { ...state, userLoaded: true, user: action.payload.user };

    case "user/create":
      return {
        ...state,
        error: null,
        user: action.payload.user,
        users: [action.payload.user, ...state.users],
      };

    case "user/edit":
      return {
        ...state,
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
  dispatch({ type: "user/loadStart", payload: null });
};

/**
 *
 * @param {object} user
 * @returns
 */
export const createUserAction = (user) => async (dispatch) => {
  try {
    const response = await axios.post(`/api/users`, user);
    toast.success(i18next.t("User created"));
    dispatch({ type: "user/create", payload: response.data });
  } catch (error) {
    toast.error(error.response?.data?.message);
  }
};

/**
 *
 * @param {number} id
 * @param {object} user
 * @returns
 */
export const editUserAction = (id, user) => async (dispatch) => {
  try {
    const response = await axios.patch(`/api/users/${id}`, user);
    toast.success(i18next.t("User updated"));
    dispatch({ type: "user/edit", payload: response.data });
  } catch (error) {
    toast.error(error.response?.data?.message);
  }
};

export const deleteUserAction = (id) => async (dispatch) => {
  try {
    await axios.delete(`/api/users/${id}`);
    toast.success(i18next.t("user.message.deleted"));
    dispatch({ type: "user/delete", payload: id });
  } catch (error) {
    toast.error(error.response?.data?.message);
  }
};
