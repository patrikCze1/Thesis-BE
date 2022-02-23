import React, { useEffect, useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import { Trans } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";

import { ROLES } from "../../../utils/enum";
import { useModuleInfoModal } from "../../hooks/common";
import {
  loadBoardDetailAction,
  loadBoardsAction,
} from "../../reducers/project/board.reducer";
import { loadProjectAction } from "../../reducers/project/project.reducer";
import { hasRole } from "../../service/role.service";
import Loader from "../common/Loader";
import BoardForm from "./component/BoardForm";
import BoardItem from "./component/BoardItem";

export default function ProjectBoardsScreen() {
  const search = window.location.search;
  const params = new URLSearchParams(search);

  const dispatch = useDispatch();
  const history = useHistory();
  const editBoardRef = useRef(false);
  const { id: projectId } = useParams();
  const { handleShow } = useModuleInfoModal();
  const [showForm, setShowForm] = useState(false);
  const { user } = useSelector((state) => state.currentUserReducer);
  const { project } = useSelector((state) => state.projectReducer);
  const { boards, boardsLoaded } = useSelector((state) => state.boardReducer);
  console.log("boards", boards);
  console.log("projectId", projectId);
  useEffect(() => {
    if (projectId) {
      dispatch(loadProjectAction(projectId));
      dispatch(loadBoardsAction(projectId));
    }
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

  return (
    <>
      <div className="page-header flex-wrap">
        <h4>
          {project.name} / <Trans>project.boards</Trans>
          <a href="#" onClick={handleShow} className="ml-1">
            <i className="mdi mdi-information-outline"></i>
          </a>
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
              <span aria-hidden="true">×</span>
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
    </>
  );
}
