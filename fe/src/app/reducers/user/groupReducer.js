import axios from "./../../../utils/axios.config";
import { toast } from "react-toastify";
import i18next from "i18next";
import i18n from "../../../i18n";

const initialState = {
  groups: [],
  groupsLoaded: false,
  group: {},
  groupLoading: false,
  processing: false,
};

export default function groupReducer(state = initialState, action) {
  switch (action.type) {
    case "group/loadList":
      return { ...state, groupsLoaded: false };

    case "group/listLoaded":
      return { ...state, groupsLoaded: true, groups: action.payload.groups };

    case "group/loadStart":
      return { ...state, groupLoading: true, error: null, group: {} };

    case "group/clear":
      return { ...state, error: null, group: {} };

    case "group/loadStop":
      return { ...state, groupLoading: false };

    case "group/detail":
      return { ...state, groupLoading: false, group: action.payload.group };

    case "group/create":
      return {
        ...state,
        group: action.payload.group,
        groups: [...state.groups, action.payload.group],
        error: null,
        processing: false,
      };

    case "group/edit":
      return {
        ...state,
        // group: action.payload.group,
        groups: state.groups.map((group) => {
          if (group.id === action.payload.group.id) return action.payload.group;
          else return group;
        }),
        processing: false,
      };

    case "group/delete":
      return {
        ...state,
        group: action.payload.group,
        groups: state.groups.filter((group) => group.id !== action.payload),
        error: null,
        processing: false,
      };

    case "group/actionStart":
      return { ...state, error: null, processing: true };

    case "group/actionStop":
      return { ...state, processing: false };

    default:
      return state;
  }
}

export const loadGroupsAction =
  (params = "") =>
  async (dispatch) => {
    dispatch({ type: "group/loadList", payload: null });
    try {
      const response = await axios.get(`/api/groups${params}`);
      dispatch({ type: "group/listLoaded", payload: response.data });
    } catch (error) {
      dispatch({ type: "group/listLoaded", payload: { groups: [] } });
      console.error(error);
      // toast.error(error.message);
    }
  };

export const loadGroupDetailAction = (id) => async (dispatch) => {
  dispatch({ type: "group/loadStart", payload: null });
  try {
    const response = await axios.get(`/api/groups/${id}`);
    dispatch({ type: "group/detail", payload: response.data });
  } catch (error) {
    toast.error(error.response?.data?.message);
    dispatch({ type: "group/loadStop", payload: null });
  }
};

export const clearGroupDetailAction = (id) => async (dispatch) => {
  dispatch({ type: "group/clear", payload: null });
};

export const createGroupAction = (data) => async (dispatch) => {
  dispatch({ type: "group/actionStart", payload: null });
  try {
    const response = await axios.post(`/api/groups`, data);
    dispatch({ type: "group/create", payload: response.data });
    toast.success(i18next.t("Group created"));
  } catch (error) {
    toast.error(error.response?.data?.message);
  }
};

export const editGroupAction = (id, data) => async (dispatch) => {
  dispatch({ type: "group/actionStart", payload: null });
  try {
    const response = await axios.patch(`/api/groups/${id}`, data);
    dispatch({ type: "group/edit", payload: response.data });
    toast.success(i18next.t("Group edited"));
  } catch (error) {
    toast.error(error.response?.data?.message);
    dispatch({ type: "group/actionStop", payload: null });
  }
};

export const deleteGroupAction = (id) => async (dispatch) => {
  const toastId = toast(i18n.t("message.removingGroup"), {
    autoClose: false,
    closeButton: false,
  });

  try {
    await axios.delete(`/api/groups/${id}`);
    dispatch({ type: "group/delete", payload: id });

    toast.update(toastId, {
      render: i18n.t("Group deleted"),
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
