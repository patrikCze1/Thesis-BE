import axios from "./../../../utils/axios.config";
import { toast } from "react-toastify";

const initialState = {
  checks: [],
  actionSuccess: false,
  actionProcessing: false,
};

export default function taskCheckReducer(state = initialState, action) {
  let checks = state.checks;
  switch (action.type) {
    case "check/load":
      return { ...state, checks: action.payload };

    case "check/actionStart":
      return { ...state, actionSuccess: false, actionProcessing: true };

    case "check/actionFail":
      return { ...state, actionSuccess: false, actionProcessing: false };

    case "check/create":
      return {
        ...state,
        actionSuccess: true,
        actionProcessing: false,
        checks: [...checks, action.payload.check],
      };

    case "check/edit":
      return {
        ...state,
        actionSuccess: true,
        actionProcessing: false,
        checks: state.checks.map((check) => {
          if (check.id === action.payload.check.id) return action.payload.check;
          else return check;
        }),
      };

    case "check/delete":
      return {
        ...state,
        actionSuccess: true,
        actionProcessing: false,
        checks: state.checks.filter((check) => check.id != action.payload),
      };

    default:
      return state;
  }
}

export const loadChecks = (checks) => async (dispatch) => {
  dispatch({ type: "check/load", payload: checks });
};

export const createAction = (data) => async (dispatch) => {
  dispatch({ type: "check/actionStart", payload: null });

  try {
    const response = await axios.post(`/api/tasks/checks`, data);
    dispatch({ type: "check/create", payload: response.data });
  } catch (error) {
    toast.error(error.response?.data?.message);
    dispatch({ type: "check/actionFail", payload: null });
  }
};

export const editAction = (id, data) => async (dispatch) => {
  dispatch({ type: "check/actionStart", payload: null });

  try {
    const response = await axios.patch(`/api/tasks/checks/${id}`, data);
    console.log(response.data);
    dispatch({ type: "check/edit", payload: response.data });
  } catch (error) {
    toast.error(error.response?.data?.message);
    dispatch({ type: "check/actionFail", payload: null });
  }
};

export const deleteAction = (id) => async (dispatch) => {
  dispatch({ type: "check/actionStart", payload: null });

  try {
    const response = await axios.delete(`/api/tasks/checks/${id}`);
    console.log(response.data);
    dispatch({ type: "check/delete", payload: id });
  } catch (error) {
    toast.error(error.response?.data?.message);
    dispatch({ type: "check/actionFail", payload: null });
  }
};
