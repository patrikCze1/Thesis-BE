import axios from "./../../../utils/axios.config";
import { toast } from "react-toastify";
import i18next from "i18next";

const initialState = {
  groups: [],
  groupsLoaded: false,
  group: {},
  groupLoaded: false,
  actionProcessing: false,
};

export default function groupReducer(state = initialState, action) {
  switch (action.type) {
    case "group/loadList":
      return { ...state, groupsLoaded: false };

    case "group/listLoaded":
      return { ...state, groupsLoaded: true, groups: action.payload.groups };

    case "group/loadStart":
      return { ...state, groupLoaded: false, error: null, group: {} };

    case "group/detail":
      return { ...state, groupLoaded: true, group: action.payload.group };

    case "group/create":
      return {
        ...state,
        group: action.payload.group,
        groups: [...state.groups, action.payload.group],
        error: null,
        actionProcessing: false,
      };

    case "group/edit":
      return {
        ...state,
        // group: action.payload.group,
        groups: state.groups.map((group) => {
          if (group.id === action.payload.group.id) return action.payload.group;
          else return group;
        }),
        actionProcessing: false,
      };

    case "group/delete":
      return {
        ...state,
        group: action.payload.group,
        groups: state.groups.filter((group) => group.id !== action.payload.id),
        error: null,
        actionProcessing: false,
      };

    case "group/actionStart":
      return { ...state, error: null, actionProcessing: true };

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
      toast.error(error.message);
    }
  };

export const loadGroupDetailAction = (id) => async (dispatch) => {
  dispatch({ type: "group/loadStart", payload: null });
  try {
    const response = await axios.get(`/api/groups/${id}`);
    dispatch({ type: "group/detail", payload: response.data });
  } catch (error) {
    toast.error(error.response.data.message);
  }
};

export const clearGroupDetailAction = (id) => async (dispatch) => {
  dispatch({ type: "group/loadStart", payload: null });
};

export const createGroupAction = (data) => async (dispatch) => {
  dispatch({ type: "group/actionStart", payload: null });
  try {
    const response = await axios.post(`/api/groups`, data);
    dispatch({ type: "group/create", payload: response.data });
    toast.success(i18next.t("Group created"));
  } catch (error) {
    toast.error(error.message);
  }
};

export const editGroupAction = (id, data) => async (dispatch) => {
  dispatch({ type: "group/actionStart", payload: null });
  try {
    const response = await axios.patch(`/api/groups/${id}`, data);
    dispatch({ type: "group/edit", payload: response.data });
    toast.success(i18next.t("Group edited"));
  } catch (error) {
    toast.error(error.message);
  }
};

export const deleteGroupAction = (id) => async (dispatch) => {
  dispatch({ type: "group/actionStart", payload: null });
  try {
    const response = await axios.delete(`/api/groups/${id}`);
    dispatch({ type: "group/delete", payload: id });
    toast.success(i18next.t("Group deleted"));
  } catch (error) {
    toast.error(error.message);
  }
};
