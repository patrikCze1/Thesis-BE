import axios from "./../../../utils/axios.config";
import { toast } from "react-toastify";

const initialState = {
  notifications: [],
  count: 0,
  unreadNotifications: [],
  unreadCount: 0,
  loaded: false,
};

export default function notificationReducer(state = initialState, action) {
  switch (action.type) {
    case "notification/load":
      return { ...state, loaded: false };

    case "notification/loaded":
      return {
        ...state,
        loaded: true,
        notifications: action.payload.records.rows,
        count: action.payload.records.count,
      };

    case "notification/unreadLoaded":
      if (action.payload.records.count > 0)
        document.title = `(${action.payload.records.count}) React app`;
      return {
        ...state,
        loaded: true,
        unreadNotifications: action.payload.records.rows,
        unreadCount: action.payload.records.count,
      };

    case "notification/seen":
      if (!action.payload.notification.seen) {
        document.title = `(${state.unreadCount - 1}) React app`;
        return {
          ...state,
          notifications: state.notifications.map((notif) => {
            if (notif.id === action.payload.id)
              return { ...notif, seen: !notif.seen };
            else return notif;
          }),
          unreadNotifications: state.unreadNotifications.filter(
            (notif) => notif.id !== action.payload.id
          ),
          unreadCount: --state.unreadCount,
        };
      } else {
        document.title = `(${state.unreadCount + 1}) React app`;
        return {
          ...state,
          notifications: state.notifications.map((notif) => {
            if (notif.id === action.payload.id)
              return { ...notif, seen: !notif.seen };
            else return notif;
          }),
          unreadNotifications: [
            ...state.unreadNotifications,
            action.payload.notification,
          ],
          unreadCount: ++state.unreadCount,
        };
      }

    case "notification/seeAll":
      document.title = "React app";
      return {
        ...state,
        loaded: true,
        unreadNotifications: [],
        unreadCount: 0,
        notifications: state.notifications.map((notif) => {
          return { ...notif, seen: true };
        }),
      };

    case "notification/socketNew":
      document.title = `(${state.unreadCount + 1}) React app`;
      return {
        ...state,
        unreadNotifications: [action.payload, ...state.unreadNotifications],
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1,
        count: state.count + 1,
      };

    default:
      return state;
  }
}

export const loadNotificationsAction =
  (offset = "", limit = "") =>
  async (dispatch) => {
    dispatch({ type: "notification/load", payload: null });
    try {
      const response = await axios.get(
        `/api/notifications/?limit=${limit}&offset=${offset}`
      );
      dispatch({ type: "notification/loaded", payload: response.data });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

export const loadUnreadNotificationsAction = () => async (dispatch) => {
  dispatch({ type: "notification/load", payload: null });
  try {
    const response = await axios.get(`/api/notifications/?seen=0`);
    dispatch({ type: "notification/unreadLoaded", payload: response.data });
  } catch (error) {
    toast.error(error.response.data.message);
  }
};

export const setSeenAction = (id, notification) => async (dispatch) => {
  try {
    await axios.patch(`/api/notifications/${id}/seen`);
    dispatch({ type: "notification/seen", payload: { id, notification } });
  } catch (error) {
    toast.error(error.response.data.message);
  }
};

export const setSeenAllAction = () => async (dispatch) => {
  try {
    await axios.patch(`/api/notifications/see-all`);
    dispatch({ type: "notification/seeAll", payload: null });
  } catch (error) {
    toast.error(error.message);
  }
};

export const socketNewNotification = (notification) => async (dispatch) => {
  try {
    toast.info(notification.message);
    dispatch({ type: "notification/socketNew", payload: notification });
  } catch (error) {
    toast.error(error.response.data.message);
  }
};
