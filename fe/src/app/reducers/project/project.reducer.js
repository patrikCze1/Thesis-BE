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
  savingProject: false,
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
      return {
        ...state,
        project: {},
        projectLoaded: true,
        savingProject: false,
      };

    case "project/loadDetail":
      return { ...state, projectLoaded: false };

    case "project/detail":
      return {
        ...state,
        projectLoaded: true,
        project: action.payload.project,
        stages: [stageZero, ...action.payload.project.projectStages],
      };

    case "project/saving":
      return { ...state, savingProject: true };

    case "project/stopSaving":
      return { ...state, savingProject: false };

    case "project/create":
      toast.success(i18next.t("Project created"));
      return {
        ...state,
        projects: [...state.projects, action.payload.project],
        project: action.payload.project,
        savingProject: false,
      };

    case "project/createStage":
      toast.success(i18next.t("project.stageAdded"));
      return {
        ...state,
        stages: [...state.stages, action.payload.stage],
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
        savingProject: false,
        projects: state.projects.map((project) => {
          if (project.id === action.payload.project.id)
            return { ...project, ...action.payload.project };
          else return project;
        }),
      };

    case "project/editStages":
      toast.success(i18next.t("project.changesSaved"));
      return {
        ...state,
        stages: action.payload,
      };

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

    case "project/deleteStage":
      toast.success(i18next.t("project.stageRemoved"));
      return {
        ...state,
        stages: state.stages.filter((stage) => stage.id != action.payload),
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
  dispatch({ type: "project/saving" });
  try {
    const response = await axios.post(`/api/projects`, project);
    dispatch({ type: "project/create", payload: response.data });
  } catch (error) {
    toast.error(error.response?.data?.message);
    dispatch({ type: "project/stopSaving" });
  }
};

export const createStageAction = (projectId, stage) => async (dispatch) => {
  try {
    const res = await axios.post(`/api/projects/${projectId}/stages`, stage);
    dispatch({ type: "project/createStage", payload: res.data });
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
  dispatch({ type: "project/saving" });
  try {
    const response = await axios.patch(`/api/projects/${id}`, data);
    dispatch({ type: "project/edit", payload: response.data });
  } catch (error) {
    toast.error(error.response?.data?.message);
    dispatch({ type: "project/stopSaving" });
  }
};

export const editStagesAction = (projectId, stages) => async (dispatch) => {
  try {
    await axios.patch(`/api/projects/${projectId}/stages`, {
      stages,
    });
    dispatch({ type: "project/editStages", payload: stages });
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

export const deleteStageAction = (id) => async (dispatch) => {
  try {
    await axios.delete(`/api/projects/stages/${id}`);
    dispatch({ type: "project/deleteStage", payload: id });
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
