import axios from "./../../../utils/axios.config";
import { toast } from "react-toastify";
import i18next from "i18next";

const initialState = {
  projects: [],
  projectsLoaded: false,
  project: {},
  projectLoaded: false,
  errorMessage: null,
  stages: [],
};

const stageZero = {
  id: null,
  name: "Nepřiřazeno",
  order: 0,
};

export default function projectReducer(state = initialState, action) {
  switch (action.type) {
    case "project/loadList":
      return { ...state, projectsLoaded: false };

    case "project/listLoaded":
      return {
        ...state,
        projectsLoaded: true,
        projects: action.payload.projects,
      };

    case "project/clearProject":
      return { ...state, project: {}, projectLoaded: true };

    case "project/loadDetail":
      return { ...state, projectLoaded: false };

    case "project/detail":
      return {
        ...state,
        projectLoaded: true,
        project: action.payload.project,
        stages: [stageZero, ...action.payload.project.projectStages],
      };

    case "project/create":
      toast.success(i18next.t("Project created"));
      return {
        ...state,
        projects: [...state.projects, action.payload.project],
        project: action.payload.project,
      };

    case "project/socketNew":
      return {
        ...state,
        projects: [...state.projects, action.payload],
      };

    case "project/socketNewStage":
      if (!state.stages.some((stage) => stage.id == action.payload.id))
        return {
          ...state,
          stages: [...state.stages, action.payload],
        };
      return state;

    case "project/edit":
      toast.success(i18next.t("Project updated"));
      return {
        ...state,
        projects: state.projects.map((project) => {
          if (project.id === action.payload.project.id)
            return action.payload.project;
          else return project;
        }),
      }; //todo

    case "project/socketEdit":
      return {
        ...state,
        projects: state.projects.map((project) => {
          if (project.id === action.payload.id) return action.payload;
          else return project;
        }),
      };

    case "project/socketEditStage":
      return {
        ...state,
        stages: action.payload,
      };

    case "project/delete":
      toast.success(i18next.t("Project deleted"));
      return {
        ...state,
        projects: state.projects.filter(
          (project) => project.id != action.payload
        ),
      };

    case "project/socketDelete":
      return {
        ...state,
        projects: state.projects.filter(
          (project) => project.id != action.payload
        ),
      };

    case "project/socketDeleteStage":
      return {
        ...state,
        stages: state.stages.filter((stage) => stage.id != action.payload),
      };

    default:
      return state;
  }
}

export const loadProjectsAction = () => async (dispatch) => {
  dispatch({ type: "project/loadList", payload: null });
  try {
    const response = await axios.get(`/api/projects`, {
      withCredentials: true,
    });
    dispatch({ type: "project/listLoaded", payload: response.data });
  } catch (error) {
    toast.error(error.response?.data?.message);
  }
};

export const loadProjectAction = (id) => async (dispatch) => {
  dispatch({ type: "project/loadDetail", payload: null });
  try {
    const response = await axios.get(`/api/projects/${id}`);
    dispatch({ type: "project/detail", payload: response.data });
  } catch (error) {
    toast.error(error.response?.data?.message);
  }
};

export const clearProjectAction = () => async (dispatch) => {
  dispatch({ type: "project/clearProject" });
};

export const createProjectAction = (project) => async (dispatch) => {
  try {
    const response = await axios.post(`/api/projects`, project);
    dispatch({ type: "project/create", payload: response.data });
  } catch (error) {
    toast.error(error.response?.data?.message);
  }
};

export const socketNewProject = (project) => (dispatch) => {
  dispatch({ type: "project/socketNew", payload: project });
};

export const socketNewStage = (stage) => (dispatch) => {
  dispatch({ type: "project/socketNewStage", payload: stage });
};

export const editProjectAction = (id, data) => async (dispatch) => {
  try {
    const response = await axios.patch(`/api/projects/${id}`, data);
    dispatch({ type: "project/edit", payload: response.data });
  } catch (error) {
    toast.error(error.response?.data?.message);
  }
};

export const socketEditProject = (project) => (dispatch) => {
  dispatch({ type: "project/socketEdit", payload: project });
};

export const socketEditStages = (stages) => (dispatch) => {
  dispatch({ type: "project/socketEditStage", payload: stages });
};

export const deleteProjectAction = (id) => async (dispatch) => {
  try {
    await axios.delete(`/api/projects/${id}`);
    dispatch({ type: "project/delete", payload: id });
  } catch (error) {
    toast.error(error.response?.data?.message);
  }
};

export const socketDeleteProject = (id) => (dispatch) => {
  dispatch({ type: "project/socketDelete", payload: id });
};

export const socketDeleteStage = (id) => (dispatch) => {
  dispatch({ type: "project/socketDeleteStage", payload: id });
};
