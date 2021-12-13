import axios from "./../../../utils/axios.config";
import { toast } from "react-toastify";
import i18next from "i18next";

const initialState = {
  attachments: [],
  uploading: false,
};

export default function taskAttachmentReducer(state = initialState, action) {
  switch (action.type) {
    case "taskAttachment/set":
      return { ...state, attachments: action.payload };

    case "taskAttachment/uploadStart":
      return { ...state, uploading: true };

    case "taskAttachment/uploadFail":
      return { ...state, uploading: false };

    case "taskAttachment/upload":
      return {
        ...state,
        attachments: [...state.attachments, ...action.payload.attachments],
        uploading: false,
      };

    case "taskAttachment/delete":
      return {
        ...state,
        attachments: state.attachments.filter(
          (attachemt) => attachemt.id !== action.payload
        ),
      };

    default:
      return state;
  }
}

//   export const loadComments = (comments) => async (dispatch) => {
//     dispatch({ type: "comment/load", payload: comments });
//   };

export const setAttachmentsAction = (attachemts) => async (dispatch) => {
  dispatch({ type: "taskAttachment/set", payload: attachemts });
};

export const uploadAction = (taskId, data) => async (dispatch) => {
  dispatch({ type: "taskAttachment/uploadStart", payload: null });
  try {
    const response = await axios.post(`/api/tasks/${taskId}/attachemts`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    toast.success(i18next.t("form.filesUploaded"));

    dispatch({ type: "taskAttachment/upload", payload: response.data });
  } catch (error) {
    toast.error(error.response?.data?.message);
    dispatch({ type: "taskAttachment/uploadFail", payload: null });
  }
};

export const deleteTaskAttachmentAction = (taskId, id) => async (dispatch) => {
  try {
    await axios.delete(`/api/tasks/${taskId}/attachemts/${id}`);
    toast.success(i18next.t("form.fileDeleted"));
    dispatch({ type: "taskAttachment/delete", payload: id });
  } catch (error) {
    toast.error(error.response?.data?.message);
  }
};
