import axios from "./../../../utils/axios.config";
import { toast } from "react-toastify";
import i18next from "i18next";
import jwtDecode from "jwt-decode";

import { routeEnum } from "./../../enums/navigation/navigation";
import { getIo } from "../../../utils/websocket.config";

const initialState = {
  user: {},
  token: null,
  refreshToken: null,
  actionProcessing: false,
};

const now = new Date();
let token = null;
export default function currentUserReducer(state = initialState, action) {
  switch (action.type) {
    case "user/load":
      const data = {
        value: action.payload.token,
        expiry: now.getTime() + 1000 * 60 * 60 * 12,
      };

      window.localStorage.setItem("app-user", JSON.stringify(data));

      token = jwtDecode(action.payload.token);
      console.log("token", token);

      return { ...state, user: token.user };

    case "user/loadFromStorage":
      const itemStr = window.localStorage.getItem("app-user");

      if (!itemStr) return { ...state };

      const item = JSON.parse(itemStr);

      token = jwtDecode(item.value);
      console.log("token", token);
      if (!item.expiry || now.getTime() > item.expiry) {
        window.localStorage.removeItem("app-user");
        return { ...state };
      }

      return {
        ...state,
        user: token.user,
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
