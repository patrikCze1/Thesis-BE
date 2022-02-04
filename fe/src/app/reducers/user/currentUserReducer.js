import axios from "./../../../utils/axios.config";
import { toast } from "react-toastify";
import i18next from "i18next";
import jwtDecode from "jwt-decode";
import Cookies from "js-cookie";

import { ROUTE } from "./../../../utils/enum";
import { getIo, initIo } from "../../../utils/websocket.config";
import i18n from "../../../i18n";
import { parseUserFromJwt } from "../../service/user/user.service";

const initialState = {
  user: {},
  actionProcessing: false,
};

const now = new Date();
let token = null;
export default function currentUserReducer(state = initialState, action) {
  switch (action.type) {
    case "user/login":
      const data = {
        value: action.payload.token,
        expiry: now.getTime() + 1000 * 60 * 60 * 12,
      };

      window.localStorage.setItem("app-user", JSON.stringify(data));

      token = jwtDecode(action.payload.token);
      console.log("token", token);

      initIo();

      return { ...state, user: token.user, actionProcessing: false };

    case "user/loadFromStorage":
      // const itemStr = window.localStorage.getItem("app-user");

      // if (!itemStr) return { ...state };

      // const item = JSON.parse(itemStr);

      // token = jwtDecode(item.value);
      // console.log("token", token);
      // if (!item.expiry || now.getTime() > item.expiry) {
      //   window.localStorage.removeItem("app-user");
      //   return { ...state };
      // }

      token = parseUserFromJwt();

      if (token)
        return {
          ...state,
          user: token.user,
        };
      else return { ...state };

    case "user/actionStart":
      return { ...state, actionProcessing: true };

    case "user/actionSuccess":
      return { ...state, actionProcessing: false };

    case "user/actionFail":
      return { ...state, actionProcessing: false };

    case "user/logout":
      Cookies.remove("Auth-Token");
      Cookies.remove("Refresh-Token");
      window.localStorage.removeItem("app-user");
      const socket = getIo();
      socket.disconnect();
      //todo socket disconnect
      //todo call endpoint?
      // const socket = getIo();
      document.title = i18n.t("app.title");

      return { ...initialState };

    default:
      return state;
  }
}

export const loginAction = (email, password, history) => async (dispatch) => {
  dispatch({ type: "user/actionStart" });
  try {
    const response = await axios.post(
      `/api/auth/login`,
      { email, password },
      {
        auth: {
          username: email,
          password: password,
        },
      }
    );

    dispatch({ type: "user/login", payload: response.data });
    history.push(ROUTE.HOME);
  } catch (e) {
    dispatch({ type: "user/actionFail" });
    toast.error(e.response?.data?.message);
  }
};

// export const loadCurrentUserAction = (data) => async (dispatch) => {
//   dispatch({ type: "user/load", payload: data });
// };

export const loadFromSessionAction = () => async (dispatch) => {
  dispatch({ type: "user/loadFromStorage" });
};

export const logoutAction = (history) => async (dispatch) => {
  dispatch({ type: "user/logout" });
  history.push(ROUTE.LOGIN);
};

export const changePasswordAction = (data) => async (dispatch) => {
  dispatch({ type: "user/actionStart" });
  try {
    const response = await axios.patch(`/api/me/change-password`, data);
    dispatch({ type: "user/actionSuccess", payload: response.data });
    toast.success(i18next.t("Password changed"));
  } catch (e) {
    dispatch({ type: "user/actionFail" });
    toast.error(e.response?.data?.message);
  }
};
