import axios from "./../../../utils/axios.config";
import { toast } from "react-toastify";
import i18next from "i18next";

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

    case "tracks/loadOlder":
      return {
        ...state,
        loaded: true,
        tracks: [...state.tracks, ...action.payload.tracks],
      };

    case "tracks/start":
      return { ...state, activeTrack: action.payload.track };

    case "tracks/stop":
      toast.success(i18next.t("track.created"));
      return {
        ...state,
        activeTrack: null,
        tracks: [action.payload.track, ...state.tracks],
      };

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
  (offset = 0, limit = 40, returnTracks = true, returnActive = true) =>
  async (dispatch) => {
    dispatch({ type: "tracks/loadStart", payload: null });
    try {
      const response = await axios.get(
        `/api/tracks/me?offset=${offset}&limit=${limit}&returnActive=${returnActive}&returnTracks=${returnTracks}`
      );
      dispatch({ type: "tracks/loaded", payload: response.data });
    } catch (error) {
      toast.error(error.message);
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
      toast.error(error.message);
    }
  };

export const loadMyOlderTracks =
  (from = "", to = "") =>
  async (dispatch) => {
    dispatch({ type: "tracks/loadStart", payload: null });
    try {
      const response = await axios.get(
        `/api/tracks/me/?from=${from}&to=${to}&returnActive=false&returnTracks=true`
      );
      dispatch({ type: "tracks/loadOlder", payload: response.data });
    } catch (error) {
      toast.error(error.message);
    }
  };

export const startTimeTrackAction = (data) => async (dispatch) => {
  try {
    const response = await axios.post(`/api/tracks/start`, data);
    dispatch({ type: "tracks/start", payload: response.data });
  } catch (error) {
    toast.error(error.message);
  }
};

export const stopTimeTrackAction = (track) => async (dispatch) => {
  try {
    const response = await axios.post(`/api/tracks/stop/${track.id}`, track);
    dispatch({ type: "tracks/stop", payload: response.data });
  } catch (error) {
    toast.error(error.message);
  }
};

export const createTimeTrackAction = (data) => async (dispatch) => {
  try {
    const response = await axios.post(`/api/tracks/`, data);
    toast.success(i18next.t("track.created"));
    dispatch({ type: "tracks/stop", payload: response.data });
  } catch (error) {
    toast.error(error.message);
  }
};

export const editTimeTrackAction = (track) => async (dispatch) => {
  console.log("track", track);
  try {
    const response = await axios.patch(`/api/tracks/${track.id}`, track);
    toast.success(i18next.t("track.edited"));
    dispatch({ type: "tracks/edit", payload: response.data });
  } catch (error) {
    toast.error(error.message);
  }
};

export const deleteTimeTrackAction = (id) => async (dispatch) => {
  try {
    await axios.delete(`/api/tracks/${id}`);
    toast.success(i18next.t("track.removed"));
    dispatch({ type: "tracks/delete", payload: id });
  } catch (error) {
    toast.error(error.message);
  }
};
