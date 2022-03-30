import axios from "./../../../utils/axios.config";
import { toast } from "react-toastify";
import i18next from "i18next";
import i18n from "../../../i18n";

const initialState = {
  clients: [],
  clientsCount: 0,
  clientsLoaded: false,
  clientsError: false,
  clientsErrorMessage: "",
  client: {},
  clientLoading: false,
  clientError: false,
  clientErrorMessage: "",
  processing: false,
};

export default function clientReducer(state = initialState, action) {
  let clients;

  switch (action.type) {
    case "clients/loadStart":
      return { ...state, clientsLoaded: false };

    case "clients/load":
      return {
        ...state,
        clients: action.payload.clients.rows,
        clientsCount: action.payload.clients.count,
        clientsLoaded: true,
      };

    case "clients/loadError":
      return {
        ...state,
        clientsLoaded: true,
        clientsError: action.payload.status,
        clientsErrorMessage: action.payload.message,
      };

    case "client/detail":
      return { ...state, client: action.payload.client, clientLoading: false };

    case "client/detailLoad":
      return { ...state, clientLoading: true, client: {} };

    case "client/clearDetail":
      return { ...state, client: {} };

    case "client/detailLoadError":
      return {
        ...state,
        clientLoading: false,
        clientError: action.payload.status,
        clientErrorMessage: action.payload.message,
      };

    case "client/create":
      toast.success(i18next.t("Client created"));
      return {
        ...state,
        clients: [action.payload.client, ...state.clients],
        client: action.payload.client,
        processing: false,
      };

    case "client/edit":
      toast.success(i18next.t("Client updated"));
      clients = state.clients.map((client) => {
        if (client.id == action.payload.client.id) return action.payload.client;
        else return client;
      });
      return {
        ...state,
        client: action.payload.client,
        clients,
        processing: false,
      };

    case "client/delete":
      clients = state.clients.filter((client) => client.id != action.payload);
      return { ...state, clients, processing: false };

    case "client/actionStart":
      return { ...state, processing: true };

    case "client/actionStop":
      return { ...state, processing: false };

    default:
      return state;
  }
}

export const loadClietntsAction =
  (offset = 0, limit = 100000) =>
  async (dispatch) => {
    dispatch({ type: "clients/loadStart", payload: null });

    try {
      const response = await axios.get(
        `/api/clients?offset=${offset}&limit=${limit}`
      );

      dispatch({ type: "clients/load", payload: response.data });
    } catch (error) {
      console.log(error);
      // dispatch({ type: "clients/loadError", payload: error.response });
    }
  };

export const clientDetailAction = (id) => async (dispatch) => {
  dispatch({ type: "client/detailLoad", payload: null });

  try {
    const response = await axios.get(`/api/clients/${id}`);
    dispatch({ type: "client/detail", payload: response.data });
  } catch (error) {
    dispatch({ type: "client/clientLoadError", payload: error });
  }
};

export const clearClientAction = () => async (dispatch) => {
  dispatch({ type: "client/clearDetail", payload: null });
};

export const createClientAction = (client) => async (dispatch) => {
  dispatch({ type: "client/actionStart", payload: null });
  try {
    const response = await axios.post(`/api/clients`, client);
    dispatch({ type: "client/create", payload: response.data });
  } catch (error) {
    toast.error(error.response?.data?.message);
    dispatch({ type: "client/actionStop", payload: null });
  }
};

export const editClientAction = (id, data) => async (dispatch) => {
  dispatch({ type: "client/actionStart", payload: null });
  try {
    const response = await axios.patch(`/api/clients/${id}`, data);
    dispatch({ type: "client/edit", payload: response.data });
  } catch (error) {
    toast.error(error.response?.data?.message);
    dispatch({ type: "client/actionStop", payload: null });
  }
};

export const deleteClientAction = (id) => async (dispatch) => {
  const toastId = toast(i18n.t("message.removingClient"), {
    autoClose: false,
    closeButton: false,
  });

  try {
    await axios.delete(`/api/clients/${id}`);
    dispatch({ type: "client/delete", payload: id });
    toast.update(toastId, {
      render: i18next.t("Client deleted"),
      type: "success",
      autoClose: true,
    });
  } catch (error) {
    toast.update(toastId, {
      render: error.response?.data?.message,
      type: "error",
      autoClose: true,
    });
  }
};
