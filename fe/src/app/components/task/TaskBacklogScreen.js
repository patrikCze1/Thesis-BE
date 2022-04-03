import React, { useEffect } from "react";
import { Trans } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import i18n from "../../../i18n";
import { SOCKET, TASK_ACTION_TYPE } from "../../../utils/enum";
import { getIo } from "../../../utils/websocket.config";
import { useProjectDetail } from "../../hooks/project";
import { useCreateTask, useTaskDetail } from "../../hooks/task";
import { usePagination } from "../../hooks/usePagination";
import { loadBoardsAction } from "../../reducers/project/board.reducer";
import { loadProjectAction } from "../../reducers/project/project.reducer";
import {
  loadBacklogTasksAction,
  socketDeleteTask,
  socketEditTask,
  socketNewTask,
} from "../../reducers/task/task.reducer";
import { objectIsNotEmpty } from "../../service/utils";
import TaskTable from "./component/TaskTable";

const paginationLimit = 20;
export default function TaskBacklogScreen() {
  const dispatch = useDispatch();
  const { id: projectId } = useParams();
  const { renderModal } = useTaskDetail(projectId, TASK_ACTION_TYPE.BACKLOG);
  const { renderForm, setShowNewTaskForm, showNewTaskForm } = useCreateTask(
    projectId,
    null
  );
  const { project } = useProjectDetail(projectId);

  const { backlogTasks, backlogTasksCount, tasksLoaded } = useSelector(
    (state) => state.taskReducer
  );
  const [paginationOffset, renderPagination] = usePagination(
    paginationLimit,
    0,
    backlogTasksCount
  );

  const handleWebsockets = () => {
    const socket = getIo();
    console.log("handleWebsockets", socket);
    try {
      socket.on(SOCKET.TASK_NEW, (data) => {
        console.log("socket TASK_NEW", data);
        if (data.task.boardId == null) dispatch(socketNewTask(data.task));
      });
      socket.on(SOCKET.TASK_EDIT, (data) => {
        console.log("socket TASK_EDIT", data);
        if (data.task.boardId == null) dispatch(socketEditTask(data.task));
      });
      socket.on(SOCKET.TASK_DELETE, (data) => {
        console.log("socket.on(SOCKET.TASK_DELETE data", data);
        dispatch(socketDeleteTask(data.id, data.type));
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
      console.log("remove socket listeners");
      if (socket) {
        socket.off(SOCKET.TASK_NEW);
        socket.off(SOCKET.TASK_EDIT);
        socket.off(SOCKET.TASK_DELETE);
      }
    };
  }, [projectId]);

  useEffect(() => {
    if (objectIsNotEmpty(project))
      dispatch(
        loadBacklogTasksAction(
          projectId,
          `?archived=false&stageId=null&offset=${paginationOffset}&orderBy=priority`
        )
      );
  }, [project, paginationOffset]);

  return (
    <>
      <div className="page-header flex-wrap p-relative">
        <h4>
          {project.name} / {i18n.t("task.backlog")} ({backlogTasksCount})
        </h4>
        <div className="d-lg-flex flex-column flex-md-row ml-md-0 ml-md-auto my-2 wrapper">
          <div className="d-flex mt-4 mt-md-0 mb-2">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowNewTaskForm(!showNewTaskForm)}
            >
              <Trans>Create</Trans>
            </button>
          </div>
        </div>
        <div className="mt-5 p-relative">{renderForm()}</div>
      </div>

      <div className="row">
        <div className="col-lg-12">
          <TaskTable
            tasks={backlogTasks}
            tasksLoaded={tasksLoaded}
            renderPagination={renderPagination}
          />
        </div>
        {renderModal()}
      </div>
    </>
  );
}
