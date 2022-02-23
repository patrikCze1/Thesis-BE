import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, NavLink } from "react-router-dom";

import i18n from "../../../i18n";
import { ROUTE, TASK_ACTION_TYPE } from "../../../utils/enum";
import { useProjectDetail } from "../../hooks/project";
import { useInitShowTask, useTaskDetail } from "../../hooks/task";
import { usePagination } from "../../hooks/usePagination";
import { loadProjectAction } from "../../reducers/project/project.reducer";
import { loadArchiveTasksAction } from "../../reducers/task/task.reducer";
import { createRouteWithParams } from "../../service/router.service";
import { objectIsNotEmpty } from "../../service/utils";
import Loader from "../common/Loader";
import TaskArchiveItem from "./component/TaskArchiveItem";

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
  }, [projectId]);

  useEffect(() => {
    if (objectIsNotEmpty(project))
      dispatch(
        loadArchiveTasksAction(
          projectId,
          `?archive=true&offset=${paginationOffset}`
        )
      );
  }, [project, paginationOffset]);

  return (
    <>
      <div className="page-header flex-wrap">
        <h4>
          {project.name} / {i18n.t("task.archive")}
        </h4>
      </div>

      <div className="row">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body">
              {/* <div className="d-sm-flex pb-4 mb-4 border-bottom">
              <div className="d-flex align-items-center">
                <h5 className="page-title">
                  
                </h5>
                <p className=" mb-0 ml-3 text-muted">({archiveTasksCount})</p>
              </div>
            </div> */}

              <div className="row">
                <div className="col-12">
                  {tasksLoaded ? (
                    archiveTasks.length > 0 ? (
                      archiveTasks.map((task) => (
                        <TaskArchiveItem key={task.id} task={task} />
                      ))
                    ) : (
                      <p className="text-center">{i18n.t("label.noRecords")}</p>
                    )
                  ) : (
                    <Loader />
                  )}
                </div>
              </div>
            </div>

            {renderPagination()}
          </div>
        </div>
        {renderModal()}
      </div>
    </>
  );
}
