import axios from "./../../../utils/axios.config";
import { toast } from "react-toastify";
import i18n from "../../../i18n";

const initialState = {
  comments: [],
  actionSuccess: false,
  processing: false,
  loading: false,
  creating: false,
};

export default function taskCommentReducer(state = initialState, action) {
  switch (action.type) {
    case "comment/load":
      return { ...state, comments: action.payload };

    case "comment/actionStart":
      return {
        ...state,
        actionSuccess: false,
        processing: true,
        loading: true,
      };

    case "comment/startCreating":
      return {
        ...state,
        creating: true,
      };

    case "comment/actionFail":
      return {
        ...state,
        actionSuccess: false,
        processing: false,
        creating: false,
        loading: false,
      };

    case "comment/create":
      if (state.comments.some((comm) => comm.id === action.payload.comment.id))
        return { ...state, actionSuccess: true, creating: false };
      return {
        ...state,
        actionSuccess: true,
        creating: false,
        comments: [action.payload.comment, ...state.comments],
      };

    case "comment/socketNew":
      if (
        state.comments.some((comm) => comm.id === action.payload.id) ||
        state.processing
      )
        return state;
      return {
        ...state,
        comments: [action.payload, ...state.comments],
      };

    case "comment/edit":
      return {
        ...state,
        actionSuccess: true,
        processing: false,
        comments: state.comments.map((comment) => {
          if (comment.id == action.payload.comment.id) return action.payload;
          else return comment;
        }),
      };

    case "comment/delete":
      return {
        ...state,
        actionSuccess: true,
        processing: false,
        comments: state.comments.filter(
          (comment) => comment.id !== action.payload
        ),
      };
    case "comment/socketDelete":
      return {
        ...state,

        comments: state.comments.filter(
          (comment) => comment.id !== action.payload
        ),
      };

    default:
      return state;
  }
}

export const loadComments = (comments) => async (dispatch) => {
  dispatch({ type: "comment/load", payload: comments });
};

export const createAction = (taskId, data) => async (dispatch) => {
  dispatch({ type: "comment/startCreating", payload: null });
  try {
    const response = await axios.post(`/api/tasks/${taskId}/comments`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    dispatch({ type: "comment/create", payload: response.data });
    dispatch({
      type: "task/changeCommentsCount",
      payload: { taskId, value: 1 },
    });
  } catch (error) {
    toast.error(error.response?.data?.message);
    dispatch({ type: "comment/actionFail", payload: null });
  }
};

export const socketNewComment = (comment) => async (dispatch) => {
  dispatch({ type: "comment/socketNew", payload: comment });
};

export const editAction = (taskId, comment) => async (dispatch) => {
  dispatch({ type: "comment/actionStart", payload: null });

  try {
    const response = await axios.patch(
      `/api/tasks/${taskId}/comments${comment.id}`,
      comment
    );

    dispatch({ type: "comment/edit", payload: response.data });
  } catch (error) {
    toast.error(error.response?.data?.message);
    dispatch({ type: "comment/actionFail", payload: null });
  }
};

export const deleteTaskCommentAction =
  (taskId, commentId) => async (dispatch) => {
    const toastId = toast(i18n.t("message.removingComment"), {
      autoClose: false,
      closeButton: false,
    });

    try {
      await axios.delete(`/api/tasks/${taskId}/comments/${commentId}`);

      toast.update(toastId, {
        render: i18n.t("comment.commentDeleted"),
        type: "success",
        autoClose: true,
      });
      dispatch({ type: "comment/delete", payload: commentId });
      dispatch({
        type: "task/changeCommentsCount",
        payload: { taskId, value: -1 },
      });
    } catch (error) {
      toast.update(toastId, {
        render: error.response?.data?.message,
        type: "error",
        autoClose: true,
      });
    }
  };

export const socketDeleteComment = (id) => async (dispatch) => {
  dispatch({ type: "comment/socketDelete", payload: id });
};
