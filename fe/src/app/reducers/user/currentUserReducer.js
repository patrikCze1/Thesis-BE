import axios from "./../../../utils/axios.config";
import { toast } from "react-toastify";
import i18next from "i18next";
import CryptoJS from "crypto-js";
import Cookies from "js-cookie";

import { ROUTE } from "./../../../utils/enum";
import { getIo, initIo } from "../../../utils/websocket.config";
import i18n from "../../../i18n";
import { parseUserFromStorage } from "../../service/user/user.service";

const initialState = {
  user: {},
  actionProcessing: false,
};

const now = new Date();
export default function currentUserReducer(state = initialState, action) {
  switch (action.type) {
    case "currentuser/login":
      const data = {
        value: encrypt(JSON.stringify(action.payload)),
        expiry: now.getTime() + 1000 * 60 * 60 * 12,
      };
      console.log("data", data);
      window.localStorage.setItem("app-user", JSON.stringify(data));

      initIo();

      return {
        ...state,
        user: action.payload,
        actionProcessing: false,
      };

    case "currentuser/loadFromStorage":
      const user = parseUserFromStorage();

      console.log("loadFromStorage", user);

      if (user)
        return {
          ...state,
          user,
        };
      else return { ...state };

    case "currentuser/actionStart":
      return { ...state, actionProcessing: true };

    case "currentuser/actionSuccess":
      return { ...state, actionProcessing: false };

    case "currentuser/actionFail":
      return { ...state, actionProcessing: false };

    case "currentuser/update":
      let storageData = window.localStorage.getItem("app-user");
      storageData = JSON.parse(storageData);
      const updatedUser = { ...state.user, ...action.payload };
      storageData.value = encrypt(JSON.stringify(updatedUser));
      window.localStorage.setItem("app-user", JSON.stringify(storageData));

      return {
        ...state,
        actionProcessing: false,
        user: updatedUser,
      };

    case "currentuser/logout":
      Cookies.remove("Auth-Token");
      Cookies.remove("Refresh-Token");
      window.localStorage.removeItem("app-user");
      const socket = getIo();
      socket.disconnect();
      //todo socket disconnect
      //todo call endpoint?
      document.title = i18n.t("app.title");

      return { ...initialState };

    default:
      return state;
  }
}

export const loginAction = (data, history) => async (dispatch) => {
  dispatch({ type: "currentuser/actionStart" });
  try {
    const response = await axios.post(
      `/api/auth/login`,
      { ...data },
      {
        auth: {
          username: data.email,
          password: data.password,
        },
      }
    );
    console.log("response.data.user", response.data.user);
    console.log(
      "typeof response.data.user.roles",
      typeof response.data.user.roles
    );
    //get csrf token
    await axios.get(`/api/me/csrf`);

    const user = {
      ...response.data.user,
      roles: JSON.parse(response.data.user.roles.replace(/\\/g, "")),
    };
    console.log("user", user);

    dispatch({ type: "currentuser/login", payload: user });
    history.push(ROUTE.HOME);
  } catch (e) {
    console.error(e);
    dispatch({ type: "currentuser/actionFail" });
    toast.error(e.response?.data?.message);
  }
};

// export const loadCurrentUserAction = (data) => async (dispatch) => {
//   dispatch({ type: "currentuser/load", payload: data });
// };

export const loadFromSessionAction = () => async (dispatch) => {
  dispatch({ type: "currentuser/loadFromStorage" });
};

export const logoutAction = (history) => async (dispatch) => {
  dispatch({ type: "currentuser/logout" });
  history.push(ROUTE.LOGIN);
};

export const changePasswordAction = (data) => async (dispatch) => {
  dispatch({ type: "currentuser/actionStart" });
  try {
    const response = await axios.patch(`/api/me/change-password`, data);
    dispatch({ type: "currentuser/actionSuccess", payload: response.data });
    toast.success(i18next.t("Password changed"));
  } catch (e) {
    dispatch({ type: "currentuser/actionFail" });
    toast.error(e.response?.data?.message);
  }
};

export const updateAction = (data) => async (dispatch) => {
  dispatch({ type: "currentuser/actionStart" });
  try {
    const response = await axios.patch(`/api/me/update`, data);
    const user = {
      ...response.data.user,
      roles: JSON.parse(response.data.user.roles.replace(/\\/g, "")),
    };
    dispatch({ type: "currentuser/update", payload: user });
    toast.success(i18next.t("alert.changesSaved"));
  } catch (e) {
    dispatch({ type: "currentuser/actionFail" });
    toast.error(e.response?.data?.message);
  }
};

function encrypt(str) {
  return CryptoJS.AES.encrypt(str, "Secret Passphrase").toString();
}
