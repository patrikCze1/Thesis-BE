import axios from "./../../../utils/axios.config";
import { toast } from "react-toastify";
import i18n from "../../../i18n";

const initialState = {
  boards: [],
  boardsLoaded: false,
  board: {},
  boardLoaded: false,
  working: false,
  stages: [],
};

export default function boardReducer(state = initialState, action) {
  switch (action.type) {
    case "board/loadList":
      return { ...state, boardsLoaded: false };

    case "board/loadListFail":
      return { ...state, boardsLoaded: true };

    case "board/listLoaded":
      return { ...state, boardsLoaded: true, boards: action.payload.boards };

    case "board/loadDetail":
      return { ...state, boardLoaded: false };

    case "board/detailLoaded":
      return {
        ...state,
        boardLoaded: true,
        board: action.payload.board,
        stages: action.payload.stages,
      };

    case "board/loadDetailFail":
      return { ...state, boardLoaded: true };

    case "board/create":
      toast.success(i18n.t("message.boardCreated"));

      return {
        ...state,
        working: false,
        boards: [...state.boards, action.payload.board],
      };

    case "board/edit":
      toast.success(i18n.t("message.boardUpdated"));

      return {
        ...state,
        working: false,
        boards: state.boards.map((board) => {
          if (board.id === action.payload.board.id) return action.payload.board;
          else return board;
        }),
      };

    case "board/delete":
      toast.success(i18n.t("message.boardDeleted"));
      return {
        ...state,
        working: false,
        boards: state.boards.filter((board) => board.id !== action.payload),
      };

    case "board/actionStart":
      return { ...state, working: true };

    case "board/actionStop":
      return { ...state, working: false };

    case "stage/create":
      toast.success(i18n.t("message.stageCreated"));
      return {
        ...state,
        working: false,
        // stages: [...state.stages, action.payload.stage],
      };

    case "stage/edit":
      toast.success(i18n.t("alert.changesSaved"));
      return {
        ...state,
        working: false,
        stages: action.payload,
      };

    case "stage/delete":
      toast.success(i18n.t("message.stageDeleted"));
      return {
        ...state,
        working: false,
        stages: state.stages.filter((stage) => stage.id !== action.payload),
      };

    case "stage/socketNewStage":
      if (!state.stages.some((stage) => stage.id == action.payload.id))
        return {
          ...state,
          stages: [...state.stages, action.payload],
        };
      return state;

    case "stage/socketEditStage":
      return {
        ...state,
        stages: action.payload,
      };

    case "stage/socketDeleteStage":
      return {
        ...state,
        stages: state.stages.filter((stage) => stage.id != action.payload),
      };

    default:
      return state;
  }
}

export const loadBoardsAction = (projectId) => async (dispatch) => {
  dispatch({ type: "board/loadList", payload: null });
  try {
    const response = await axios.get(`/api/projects/${projectId}/boards`);
    dispatch({ type: "board/listLoaded", payload: response.data });
  } catch (error) {
    dispatch({ type: "board/loadListFail", payload: null });
    toast.error(error.response?.data?.message);
  }
};

export const loadBoardDetailAction =
  (projectId, boardId) => async (dispatch) => {
    dispatch({ type: "board/loadDetail", payload: null });
    try {
      const response = await axios.get(
        `/api/projects/${projectId}/boards/${boardId}`
      );
      dispatch({ type: "board/detailLoaded", payload: response.data });
    } catch (error) {
      dispatch({ type: "board/loadDetailFail", payload: null });
      toast.error(error.response?.data?.message);
    }
  };

export const createBoardAction = (projectId, data) => async (dispatch) => {
  dispatch({ type: "board/actionStart", payload: null });
  try {
    const response = await axios.post(
      `/api/projects/${projectId}/boards`,
      data
    );
    dispatch({ type: "board/create", payload: response.data });
  } catch (error) {
    dispatch({ type: "board/actionStop", payload: null });
    toast.error(error.response?.data?.message);
  }
};

export const editBoardAction =
  (projectId, boardId, data) => async (dispatch) => {
    dispatch({ type: "board/actionStart", payload: null });
    try {
      const response = await axios.patch(
        `/api/projects/${projectId}/boards/${boardId}`,
        data
      );
      dispatch({ type: "board/edit", payload: response.data });
    } catch (error) {
      dispatch({ type: "board/actionStop", payload: null });
      toast.error(error.response?.data?.message);
    }
  };

export const deleteBoardAction = (boardId) => async (dispatch) => {
  try {
    await axios.delete(`/api/projects/boards/${boardId}`);
    dispatch({ type: "board/delete", payload: boardId });
  } catch (error) {
    toast.error(error.response?.data?.message);
  }
};

export const createStageAction = (boardId, data) => async (dispatch) => {
  dispatch({ type: "board/actionStart", payload: null });
  try {
    const response = await axios.post(`/api/boards/${boardId}/stages`, data);
    dispatch({ type: "stage/create", payload: response.data });
  } catch (error) {
    dispatch({ type: "board/actionStop", payload: null });
    toast.error(error.response?.data?.message);
  }
};

export const editStagesAction = (boardId, data) => async (dispatch) => {
  dispatch({ type: "board/actionStart", payload: null });
  try {
    await axios.patch(`/api/boards/${boardId}/stages`, { stages: data });
    dispatch({ type: "stage/edit", payload: data });
  } catch (error) {
    dispatch({ type: "board/actionStop", payload: null });
    toast.error(error.response?.data?.message);
  }
};

export const deleteStageAction = (stageId) => async (dispatch) => {
  dispatch({ type: "board/actionStart", payload: null });
  try {
    await axios.delete(`/api/boards/stages/${stageId}`);
    dispatch({ type: "stage/delete", payload: stageId });
  } catch (error) {
    dispatch({ type: "board/actionStop", payload: null });
    toast.error(error.response?.data?.message);
  }
};

export const socketNewStage = (stage) => (dispatch) => {
  dispatch({ type: "stage/socketNewStage", payload: stage });
};

export const socketEditStages = (stages) => (dispatch) => {
  dispatch({ type: "stage/socketEditStage", payload: stages });
};

export const socketDeleteStage = (id) => (dispatch) => {
  dispatch({ type: "stage/socketDeleteStage", payload: id });
};
