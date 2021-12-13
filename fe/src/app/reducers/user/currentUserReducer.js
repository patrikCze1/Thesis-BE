import axios from "./../../../utils/axios.config";
import { toast } from "react-toastify";
import i18next from "i18next";

import { routeEnum } from "./../../enums/navigation/navigation";
import { getIo } from "../../../utils/websocket.config";

const initialState = {
  user: {},
  token: null,
  refreshToken: null,
  actionProcessing: false,
};

export default function currentUserReducer(state = initialState, action) {
  switch (action.type) {
    case "user/load":
      return { ...state, user: action.payload.user };

    case "user/loadFromStorage":
      return {
        ...state,
        user: JSON.parse(window.localStorage.getItem("app-user")),
      };

    case "user/actionStart":
      return { ...state, actionProcessing: true };

    case "user/actionSuccess":
      return { ...state, actionProcessing: false };

    case "user/actionFail":
      return { ...state, actionProcessing: false };

    case "user/logout":
      return { ...initialState };

    default:
      return state;
  }
}

export const loadCurrentUserAction = (data) => async (dispatch) => {
  window.localStorage.setItem("app-user", JSON.stringify(data.user));

  dispatch({ type: "user/load", payload: data });
};

export const loadFromSessionAction = () => async (dispatch) => {
  dispatch({ type: "user/loadFromStorage" });
};

export const logoutAction = (history) => async (dispatch) => {
  dispatch({ type: "user/logout" });
  //todo socket disconnect
  //todo call endpoint?
  // const socket = getIo();
  document.title = "React app";
  history.push(routeEnum.LOGIN);
};

export const changePasswordAction = (data) => async (dispatch) => {
  dispatch({ type: "user/actionStart" });
  try {
    const response = await axios.patch(`/api/me/change-password`, data);
    dispatch({ type: "user/actionSuccess", payload: response.data });
    toast.success(i18next.t("Password changed"));
  } catch (e) {
    dispatch({ type: "user/actionFail" });
    toast.error(e.response.data.message);
  }
};
