import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  clearProjectAction,
  loadProjectAction,
} from "../reducers/project/project.reducer";

export function useShowProjectForm() {
  const dispatch = useDispatch();
  const history = useHistory();
  const [formVisible, setFormVisible] = useState(false);
  const search = window.location.search;
  const params = new URLSearchParams(search);
  console.log("formVisible", formVisible);
  const showForm = (projectId = null) => {
    console.log("showForm");
    dispatch(clearProjectAction());
    if (projectId) dispatch(loadProjectAction(projectId));

    setFormVisible(true);

    history.push({
      search: `?upravit=${projectId}`,
    });
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
