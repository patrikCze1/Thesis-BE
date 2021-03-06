import React, { useEffect, useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import { Trans } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import i18n from "../../../i18n";

import { ROLES, SOCKET } from "../../../utils/enum";
import { getIo } from "../../../utils/websocket.config";
import { useModuleInfoModal } from "../../hooks/common";
import {
  loadBoardDetailAction,
  loadBoardsAction,
  socketNewBoardAction,
} from "../../reducers/project/board.reducer";
import { loadProjectAction } from "../../reducers/project/project.reducer";
import { hasRole } from "../../service/role.service";
import Loader from "../common/Loader";
import { NotFound } from "../error";
import BoardForm from "./component/BoardForm";
import BoardItem from "./component/BoardItem";

export default function ProjectBoardsScreen() {
  const search = window.location.search;
  const params = new URLSearchParams(search);

  const dispatch = useDispatch();
  const history = useHistory();
  const editBoardRef = useRef(false);
  const { id: projectId } = useParams();
  const { handleShowInfoModal, renderInfoModal } = useModuleInfoModal();
  const [showForm, setShowForm] = useState(false);
  const { user } = useSelector((state) => state.currentUserReducer);
  const { project } = useSelector((state) => state.projectReducer);
  const { boards, boardsLoaded } = useSelector((state) => state.boardReducer);
  console.log("boards", boards);
  console.log("projectId", projectId);

  const handleWebsockets = () => {
    const socket = getIo();
    console.log("socket", socket);
    try {
      socket.on(SOCKET.PROJECT_BOARD_NEW, (data) => {
        if (data.board.projectId === projectId)
          dispatch(socketNewBoardAction(data.board));
      });
    } catch (error) {
      console.error(error);
    }

    return socket;
  };

  useEffect(() => {
    if (projectId) {
      dispatch(loadProjectAction(projectId));
      dispatch(loadBoardsAction(projectId));
    }

    const socket = handleWebsockets();
    return () => {
      if (socket) socket.off(SOCKET.PROJECT_BOARD_NEW);
    };
  }, [projectId]);

  useEffect(() => {
    console.log('queryParams.get("upravit")', params.get("upravit"));
    if (params.has("upravit") && params.get("upravit")) {
      setShowForm(true);
      editBoardRef.current = true;
      dispatch(loadBoardDetailAction(projectId, params.get("upravit")));
    }
  }, [search]);

  console.log("boardsLoaded", boardsLoaded);
  const handleShowForm = () => {
    setShowForm(true);
  };

  const handleHideForm = () => {
    setShowForm(false);
    editBoardRef.current = false;
    if (params.has("upravit")) {
      params.delete("upravit");
      history.replace({
        search: params.toString(),
      });
    }
  };

  if (project === null) {
    return <NotFound />;
  }

  return (
    <>
      <div className="page-header flex-wrap">
        <h4>
          {project.name} / <Trans>project.boards</Trans>
          <button
            onClick={handleShowInfoModal}
            className="ml-1 p-0 btn btn-link"
          >
            <i className="mdi mdi-information-outline"></i>
          </button>
        </h4>
        {hasRole([ROLES.ADMIN, ROLES.MANAGEMENT], user.roles) && (
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
        {boardsLoaded ? (
          boards.map((board) => (
            <BoardItem board={board} key={board.id} user={user} />
          ))
        ) : (
          <Loader />
        )}
      </div>

      {showForm && (
        <Modal size="lg" show={showForm} onHide={handleHideForm}>
          <Modal.Body>
            <button
              type="button"
              className="close close-modal"
              onClick={handleHideForm}
            >
              <span aria-hidden="true">??</span>
              <span className="sr-only">
                <Trans>Close</Trans>
              </span>
            </button>
            <BoardForm
              projectId={projectId}
              isEdit={editBoardRef.current}
              closeForm={handleHideForm}
            />
          </Modal.Body>
        </Modal>
      )}

      {renderInfoModal(i18n.t("label.projectDescription"), project.description)}
    </>
  );
}
