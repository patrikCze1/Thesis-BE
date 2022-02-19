import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { Trans } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import Loader from "../components/common/Loader";
import TaskForm from "../components/task/TaskForm";
import { loadTaskDetailAction } from "../reducers/task/task.reducer";

export function useTaskDetail(projectId) {
  const dispatch = useDispatch();
  const history = useHistory();
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const { task, taskLoaded } = useSelector((state) => state.taskReducer);

  const search = window.location.search;
  const params = new URLSearchParams(search);
  const selectedTask = params.get("ukol");

  useEffect(() => {
    console.log("useTaskDetail useEffect", selectedTask);
    if (selectedTask) dispatch(loadTaskDetailAction(projectId, selectedTask));
  }, [selectedTask]);

  useEffect(() => {
    if (taskLoaded && selectedTask) {
      setShowTaskDetail(true);
    }
  }, [taskLoaded]);

  const handleHideTaskDetail = () => {
    setShowTaskDetail(false);
    const queryParams = new URLSearchParams(window.location.search);
    console.log("handleHideTaskDetail");
    if (queryParams.has("ukol")) {
      queryParams.delete("ukol");
      history.replace({
        search: queryParams.toString(),
      });
    }
  };

  const renderModal = () => {
    if (showTaskDetail)
      return (
        <Modal
          size="lg"
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
              <TaskForm task={task} hideModal={handleHideTaskDetail} />
            </Modal.Body>
          ) : (
            <Loader />
          )}
        </Modal>
      );
  };

  return {
    showTaskDetail,
    selectedTask,
    handleHideTaskDetail,
    renderModal,
    setShowTaskDetail,
  };
}

export const useInitShowTask = (task) => {
  const history = useHistory();
  const dispatch = useDispatch();

  const click = () => {
    dispatch(loadTaskDetailAction(task.projectId, task.id));
    history.push({
      search: `?ukol=${task.id}`,
    });
  };

  return {
    click,
  };
};
