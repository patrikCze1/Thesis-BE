import axios from "./../../../utils/axios.config";
import { toast } from "react-toastify";
import i18next from "i18next";

const initialState = {
  clients: [],
  clientsCount: 0,
  clientsLoaded: false,
  clientsError: false,
  clientsErrorMessage: "",
  client: {},
  clientLoaded: false,
  clientError: false,
  clientErrorMessage: "",
};

export default function clientReducer(state = initialState, action) {
  let clients;

  switch (action.type) {
    case "client/load":
      return {
        ...state,
        clients: action.payload.clients.rows,
        clientsCount: action.payload.clients.count,
        clientsLoaded: true,
      };

    case "client/loadClients":
      return { ...state, clientsLoaded: false };

    case "client/clientsLoadError":
      return {
        ...state,
        clientsLoaded: true,
        clientsError: action.payload.status,
        clientsErrorMessage: action.payload.message,
      };

    case "client/detail":
      return { ...state, client: action.payload.client, clientLoaded: true };

    case "client/detailLoad":
      return { ...state, clientLoaded: false, client: {} };

    case "client/detailLoadError":
      return {
        ...state,
        clientLoaded: true,
        clientError: action.payload.status,
        clientErrorMessage: action.payload.message,
      };

    case "client/create":
      toast.success(i18next.t("Client created"));
      return { ...state, clients: [action.payload.client, ...state.clients] };

    case "client/edit":
      toast.success(i18next.t("Client updated"));
      clients = state.clients.map((client) => {
        if (client.id == action.payload.client.id) return action.payload.client;
        else return client;
      });
      return { ...state, client: action.payload.client, clients };

    case "client/delete":
      toast.success(i18next.t("Client deleted"));
      clients = state.clients.filter((client) => client.id != action.payload);
      return { ...state, clients };

    default:
      return state;
  }
}

export const loadClietntsAction =
  (offset = 0, limit = 100000) =>
  async (dispatch) => {
    dispatch({ type: "client/loadClients", payload: null });

    try {
      const response = await axios.get(
        `/api/clients?offset=${offset}&limit=${limit}`
      );

      dispatch({ type: "client/load", payload: response.data });
    } catch (error) {
      console.log(error);
      // dispatch({ type: "client/clientsLoadError", payload: error.response });
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

export const createClientAction = (client) => async (dispatch) => {
  try {
    const response = await axios.post(`/api/clients`, client);
    dispatch({ type: "client/create", payload: response.data });
  } catch (error) {
    toast.error(error.response.data.message);
  }
};

export const editClientAction = (id, data) => async (dispatch) => {
  try {
    const response = await axios.patch(`/api/clients/${id}`, data);
    dispatch({ type: "client/edit", payload: response.data });
  } catch (error) {
    toast.error(error.response.data.message);
  }
};

export const deleteClientAction = (id) => async (dispatch) => {
  try {
    await axios.delete(`/api/clients/${id}`);
    dispatch({ type: "client/delete", payload: id });
  } catch (error) {
    toast.error(error.response.data.message);
  }
};
