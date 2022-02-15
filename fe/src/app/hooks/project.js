import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  clearProjectAction,
  loadProjectAction,
} from "../reducers/project/project.reducer";
import { loadUsersByProject } from "../reducers/user/userReducer";
import { objectIsNotEmpty } from "../service/utils";

export function useShowProjectForm() {
  const dispatch = useDispatch();
  const history = useHistory();
  const [formVisible, setFormVisible] = useState(false);
  const search = window.location.search;
  const params = new URLSearchParams(search);
  console.log("formVisible", formVisible);

  const showForm = (projectId = null) => {
    console.log("showForm projectId", projectId);
    dispatch(clearProjectAction());
    console.log("projectId", projectId);
    if (projectId) {
      dispatch(loadProjectAction(projectId));

      history.push({
        search: `?upravit=${projectId}`,
      });
    }

    setFormVisible(true);
  };

  const hideForm = () => {
    console.log("hideForm");
    setFormVisible(false);
    if (params.has("upravit")) {
      params.delete("upravit");
      history.replace({
        search: params.toString(),
      });
    }
  };

  return [showForm, hideForm, formVisible];
}

export function useProjectDetail(projectId) {
  const dispatch = useDispatch();
  const { project, projectLoaded, stages } = useSelector(
    (state) => state.projectReducer
  );

  useEffect(() => {
    if (projectId) {
      if (!objectIsNotEmpty(project) && project.id !== projectId)
        dispatch(loadProjectAction(projectId));
      dispatch(loadUsersByProject(projectId));
    }
  }, [projectId]);

  return { project, projectLoaded, stages };
}
