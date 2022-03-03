import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import i18n from "../../../i18n";
import { TASK_ACTION_TYPE } from "../../../utils/enum";
import { useProjectDetail } from "../../hooks/project";
import { useTaskDetail } from "../../hooks/task";
import { usePagination } from "../../hooks/usePagination";
import { loadBoardsAction } from "../../reducers/project/board.reducer";
import { loadProjectAction } from "../../reducers/project/project.reducer";
import { loadArchiveTasksAction } from "../../reducers/task/task.reducer";
import { objectIsNotEmpty } from "../../service/utils";
import TaskTable from "./component/TaskTable";

const paginationLimit = 20;
export default function TaskArchiveScreen() {
  const dispatch = useDispatch();
  const { id: projectId } = useParams();
  const { renderModal } = useTaskDetail(projectId, TASK_ACTION_TYPE.ARCHIVE);
  const { project } = useProjectDetail(projectId);

  const { archiveTasks, archiveTasksCount, tasksLoaded } = useSelector(
    (state) => state.taskReducer
  );
  const [paginationOffset, renderPagination] = usePagination(
    paginationLimit,
    0,
    archiveTasksCount
  );

  useEffect(() => {
    dispatch(loadProjectAction(projectId));
    dispatch(loadBoardsAction(projectId));
  }, [projectId]);

  useEffect(() => {
    if (objectIsNotEmpty(project))
      dispatch(
        loadArchiveTasksAction(
          projectId,
          `?archived=true&offset=${paginationOffset}`
        )
      );
  }, [project.id, paginationOffset]);

  return (
    <>
      <div className="page-header flex-wrap">
        <h4>
          {project.name} / {i18n.t("task.archive")} ({archiveTasksCount})
        </h4>
      </div>

      <div className="row">
        <div className="col-lg-12">
          <TaskTable
            tasks={archiveTasks}
            tasksLoaded={tasksLoaded}
            renderPagination={renderPagination}
          />
        </div>
        {renderModal()}
      </div>
    </>
  );
}
