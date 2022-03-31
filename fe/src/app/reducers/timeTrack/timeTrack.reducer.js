import axios from "./../../../utils/axios.config";
import { toast } from "react-toastify";
import i18n from "../../../i18n";

const initialState = {
  activeTrack: null,
  tracks: [],
  tracksCount: 0,
  loaded: false,
};

export default function timeTrackReducer(state = initialState, action) {
  switch (action.type) {
    case "tracks/loadStart":
      return { ...state, loaded: false };

    case "tracks/loaded":
      return {
        ...state,
        loaded: true,
        tracks:
          action.payload.tracks?.rows || action.payload.tracks || state.tracks,
        tracksCount: action.payload.tracks?.count || 0,
        activeTrack: action.payload.activeTrack
          ? action.payload.activeTrack
          : state.activeTrack,
      };

    // case "tracks/loadOlder":
    //   return {
    //     ...state,
    //     loaded: true,
    //     tracks: [...state.tracks, ...action.payload.tracks],
    //   };

    case "tracks/start":
      return { ...state, activeTrack: action.payload.track };

    case "tracks/stop":
      toast.success(i18n.t("track.created"));
      return {
        ...state,
        activeTrack: null,
        tracks: [action.payload.track, ...state.tracks],
      };

    case "tracks/socketStop":
      document.title = i18n.t("app.title");
      return { ...state, activeTrack: {} };

    case "tracks/edit":
      return {
        ...state,
        tracks: state.tracks.map((track) => {
          if (track.id === action.payload.track.id) return action.payload.track;
          else return track;
        }),
      };

    case "tracks/delete":
      return {
        ...state,
        tracks: state.tracks.filter((track) => track.id !== action.payload),
      };

    default:
      return state;
  }
}

export const loadMyTimeTracksAction =
  (
    offset = 0,
    limit = 40,
    returnTracks = true,
    returnActive = true,
    from = null,
    to = null
  ) =>
  async (dispatch) => {
    dispatch({ type: "tracks/loadStart", payload: null });
    try {
      const response = await axios.get(
        `/api/tracks/me?offset=${offset}&limit=${limit}&returnActive=${returnActive}&returnTracks=${returnTracks}&from=${from}&to=${to}`
      );
      dispatch({ type: "tracks/loaded", payload: response.data });
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

export const loadAllTimeTracksAction =
  (from = "", to = "", userId = "", projectId = "") =>
  async (dispatch) => {
    dispatch({ type: "tracks/loadStart", payload: null });
    try {
      const response = await axios.get(
        `/api/tracks/?from=${from}&to=${to}&userId=${userId}&projectId=${projectId}`
      );
      dispatch({ type: "tracks/loaded", payload: response.data });
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

export const startTimeTrackAction = (data) => async (dispatch) => {
  try {
    const response = await axios.post(`/api/tracks/start`, data);
    dispatch({ type: "tracks/start", payload: response.data });
  } catch (error) {
    toast.error(error.response?.data?.message);
  }
};

export const stopTimeTrackAction = (track) => async (dispatch) => {
  try {
    const response = await axios.post(`/api/tracks/stop/${track.id}`, track);
    dispatch({ type: "tracks/stop", payload: response.data });
  } catch (error) {
    toast.error(error.response?.data?.message);
  }
};

export const socketStopTimeTrackAction = (id) => async (dispatch) => {
  try {
    dispatch({ type: "tracks/socketStop", payload: id });
  } catch (error) {
    toast.error(error.response?.data?.message);
  }
};

export const createTimeTrackAction = (data) => async (dispatch) => {
  try {
    const response = await axios.post(`/api/tracks/`, data);
    dispatch({ type: "tracks/stop", payload: response.data });
  } catch (error) {
    toast.error(error.response?.data?.message);
  }
};

export const editTimeTrackAction = (track) => async (dispatch) => {
  try {
    const response = await axios.patch(`/api/tracks/${track.id}`, track);
    toast.success(i18n.t("track.edited"));
    dispatch({ type: "tracks/edit", payload: response.data });
  } catch (error) {
    toast.error(error.response?.data?.message);
  }
};

export const deleteTimeTrackAction = (id) => async (dispatch) => {
  const toastId = toast(i18n.t("message.removingRecord"), {
    autoClose: false,
    closeButton: false,
  });

  try {
    await axios.delete(`/api/tracks/${id}`);
    toast.update(toastId, {
      render: i18n.t("track.removed"),
      type: "success",
      autoClose: true,
    });
    dispatch({ type: "tracks/delete", payload: id });
  } catch (error) {
    toast.update(toastId, {
      render: error.response?.data?.message,
      type: "error",
      autoClose: true,
    });
  }
};
