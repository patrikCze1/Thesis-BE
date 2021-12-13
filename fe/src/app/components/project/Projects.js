import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Trans } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Modal } from "react-bootstrap";

import ProjectList from "./ProjectList";
import Loader from "./../common/Loader";

import {
  clearProjectAction,
  loadProjectsAction,
  socketDeleteProject,
  socketEditProject,
  socketNewProject,
} from "./../../reducers/project/project.reducer";
import { ioEnum } from "../../enums/websocket/io";
import { getIo } from "../../../utils/websocket.config";
import ProjectForm from "./ProjectForm";
import { hasRole } from "../../service/role.service";
import { ROLES } from "../../../utils/enum";

export default function Projects() {
  const dispatch = useDispatch();
  const history = useHistory();
  const { projects, projectsLoaded } = useSelector(
    (state) => state.projectReducer
  );
  const { user } = useSelector((state) => state.currentUserReducer);
  const [showForm, setShowForm] = useState(false);
  const selectedProject = useRef(null);
  const search = window.location.search;
  const params = new URLSearchParams(search);
  selectedProject.current = params.get("upravit");

  const handleWebsockets = () => {
    const socket = getIo();
    socket.on(ioEnum.PROJECT_NEW, (data) => {
      console.log("project new", data);
      dispatch(socketNewProject(data.project));
    });
    socket.on(ioEnum.PROJECT_EDIT, (data) => {
      console.log("project edit", data);
      dispatch(socketEditProject(data.project));
    });
    socket.on(ioEnum.PROJECT_DELETE, (data) => {
      console.log("project delete", data);
      dispatch(socketDeleteProject(data.id));
    });
  };

  useEffect(() => {
    dispatch(loadProjectsAction());
    handleWebsockets();
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);

    if (queryParams.has("upravit")) {
      setShowForm(true);
    }
  }, [params]);

  const handleShowForm = (projectId = null) => {
    setShowForm(true);
    dispatch(clearProjectAction());
    selectedProject.current = projectId;
  };

  const handleHideForm = () => {
    setShowForm(false);
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.has("upravit")) {
      queryParams.delete("upravit");
      history.replace({
        search: queryParams.toString(),
      });
    }
  };

  return (
    <>
      <div className="page-header flex-wrap">
        <h3 className="page-title">
          <Trans>Projects</Trans>
        </h3>
        {hasRole([ROLES.ADMIN, ROLES.MANAGER], user.roles) && (
          <div className="d-flex">
            <button
              onClick={() => handleShowForm(null)}
              className="btn btn-sm ml-3 btn-primary mr-0"
            >
              <Trans>Add</Trans>
            </button>
          </div>
        )}
      </div>

      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex">
                <div className="wrapper">
                  <h4 className="card-title">
                    <Trans>All Projects</Trans>
                  </h4>
                </div>
                <div className="wrapper"></div>
              </div>
              {projectsLoaded ? (
                <ProjectList projects={projects} />
              ) : (
                <Loader />
              )}
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <Modal size="lg" show={showForm} onHide={handleHideForm}>
          <Modal.Body>
            <button
              type="button"
              className="close close-modal"
              onClick={() => setShowForm(false)}
            >
              <span aria-hidden="true">×</span>
              <span className="sr-only">
                <Trans>Close</Trans>
              </span>
            </button>
            <ProjectForm projectId={selectedProject.current} />
          </Modal.Body>
        </Modal>
      )}
    </>
  );
}
