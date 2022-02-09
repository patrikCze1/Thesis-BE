import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Trans } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Modal } from "react-bootstrap";

import ProjectList from "./ProjectList";
import Loader from "./../common/Loader";

import {
  loadProjectsAction,
  socketDeleteProject,
  socketEditProject,
  socketNewProject,
} from "./../../reducers/project/project.reducer";
import { getIo } from "../../../utils/websocket.config";
import ProjectForm from "./ProjectForm";
import { hasRole } from "../../service/role.service";
import { ROLES, SOCKET } from "../../../utils/enum";
import { useShowProjectForm } from "../../hooks/project";
import { usePagination } from "../../hooks/usePagination";

export default function Projects() {
  const dispatch = useDispatch();
  // const []=usePagination() //todo
  const { projects, projectsLoaded } = useSelector(
    (state) => state.projectReducer
  );
  const { user } = useSelector((state) => state.currentUserReducer);
  const [showForm, hideForm, formVisible] = useShowProjectForm();

  const search = window.location.search;
  const params = new URLSearchParams(search);

  const handleWebsockets = () => {
    const socket = getIo();

    try {
      socket.on(SOCKET.PROJECT_NEW, (data) => {
        console.log("project new", data);
        dispatch(socketNewProject(data.project));
      });
      socket.on(SOCKET.PROJECT_EDIT, (data) => {
        console.log("project edit", data);
        dispatch(socketEditProject(data.project));
      });
      socket.on(SOCKET.PROJECT_DELETE, (data) => {
        console.log("project delete", data);
        dispatch(socketDeleteProject(data.id));
      });
    } catch (error) {
      console.error(error);
    }

    return socket;
  };

  useEffect(() => {
    console.log("projects effect");
    dispatch(loadProjectsAction());
    const io = handleWebsockets();
    if (params.has("upravit")) showForm(params.get("upravit"));

    return () => {
      io?.close();
    };
  }, []);

  useEffect(() => {
    console.log('queryParams.get("upravit")', params.get("upravit"));
    if (params.has("upravit") && params.get("upravit")) {
      showForm(params.get("upravit"));
    }
  }, [search]);

  const handleShowForm = () => {
    showForm();
  };

  const handleHideForm = () => {
    hideForm();
  };

  return (
    <>
      <div className="page-header flex-wrap">
        <h4>
          <Trans>Projects</Trans>
        </h4>
        {hasRole([ROLES.ADMIN, ROLES.MANAGER], user.roles) && (
          <div className="d-flex">
            <button
              onClick={() => handleShowForm()}
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

      {formVisible && (
        <Modal size="lg" show={formVisible} onHide={handleHideForm}>
          <Modal.Body>
            <button
              type="button"
              className="close close-modal"
              onClick={handleHideForm}
            >
              <span aria-hidden="true">×</span>
              <span className="sr-only">
                <Trans>Close</Trans>
              </span>
            </button>
            <ProjectForm projectId={null} closeForm={handleHideForm} />
          </Modal.Body>
        </Modal>
      )}
    </>
  );
}
