import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { Trans } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { ROUTE } from "../../utils/enum";

import Loader from "../components/common/Loader";
import NewTaskForm from "../components/task/component/NewTaskForm";
import TaskForm from "../components/task/TaskForm";
import { loadTaskDetailAction } from "../reducers/task/task.reducer";
import { createRouteWithParams } from "../service/router.service";

export function useTaskDetail(projectId, taskType) {
  const dispatch = useDispatch();
  const history = useHistory();
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const { task, taskLoaded } = useSelector((state) => state.taskReducer);

  const search = window.location.search;
  const params = new URLSearchParams(search);
  const selectedTaskId = params.get("id");

  useEffect(() => {
    console.log("useTaskDetail useEffect", selectedTaskId);
    if (selectedTaskId) {
      dispatch(loadTaskDetailAction(projectId, selectedTaskId));
      setShowTaskDetail(true);
    }
  }, [selectedTaskId]);

  // useEffect(() => {
  //   if (taskLoaded && selectedTaskId) {
  //     setShowTaskDetail(true);
  //   }
  // }, [taskLoaded]);

  const handleHideTaskDetail = () => {
    setShowTaskDetail(false);
    const queryParams = new URLSearchParams(window.location.search);
    console.log("handleHideTaskDetail");
    if (queryParams.has("id")) {
      queryParams.delete("id");
      history.replace({
        search: queryParams.toString(),
      });
    }
  };

  const renderModal = () => {
    if (showTaskDetail)
      return (
        <Modal
          show={showTaskDetail}
          onHide={handleHideTaskDetail}
          aria-labelledby="example-modal-sizes-title-sm"
        >
          {taskLoaded ? (
            <Modal.Body>
              <button
                type="button"
                className="close close-modal"
                onClick={handleHideTaskDetail}
              >
                <span aria-hidden="true">×</span>
                <span className="sr-only">
                  <Trans>Close</Trans>
                </span>
              </button>
              <TaskForm
                task={task}
                hideModal={handleHideTaskDetail}
                taskType={taskType}
              />
            </Modal.Body>
          ) : (
            <Loader />
          )}
        </Modal>
      );
  };

  return {
    showTaskDetail,
    selectedTaskId,
    handleHideTaskDetail,
    renderModal,
    setShowTaskDetail,
  };
}

export const useInitShowTask = () => {
  const history = useHistory();
  const dispatch = useDispatch();

  const click = (task) => {
    dispatch(loadTaskDetailAction(task.projectId, task.id));
    if (task.stageId && !task.archived)
      history.push(
        createRouteWithParams(ROUTE.PROJECTS_BOARDS_DETAIL, {
          ":id": task.projectId,
          ":boardId": task.boardId,
        }) + `?id=${task.id}`
      );
    else history.push(`?id=${task.id}`);
    //   createRouteWithParams(ROUTE.PROJECTS_DETAIL_BACKLOG, {
    //     ":id": task.projectId,
    //   }) + `?id=${task.id}`
    // );
  };

  return {
    click,
  };
};

export const useCreateTask = (projectId, boardId, parentId = null) => {
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);

  const renderForm = (className = "") => {
    return (
      showNewTaskForm && (
        <div style={{ position: "relative" }}>
          <NewTaskForm
            projectId={projectId}
            boardId={boardId}
            parentId={parentId}
            onHide={() => setShowNewTaskForm(!showNewTaskForm)}
            className={className}
          />
        </div>
      )
    );
  };

  return {
    renderForm,
    showNewTaskForm,
    setShowNewTaskForm,
  };
};
