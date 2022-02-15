import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, NavLink } from "react-router-dom";

import i18n from "../../../i18n";
import { ROUTE } from "../../../utils/enum";
import { useProjectDetail } from "../../hooks/project";
import { useInitShowTask, useTaskDetail } from "../../hooks/task";
import { usePagination } from "../../hooks/usePagination";
import { loadProjectAction } from "../../reducers/project/project.reducer";
import { loadTasksAction } from "../../reducers/task/task.reducer";
import { createRouteWithParams } from "../../service/router.service";
import { objectIsNotEmpty } from "../../service/utils";
import Loader from "../common/Loader";
import TaskTableItem from "./component/TaskTableItem";

const paginationLimit = 20;
export default function TaskBacklogScreen() {
  const dispatch = useDispatch();
  const { id: projectId } = useParams();
  const { renderModal } = useTaskDetail(projectId);
  const { project } = useProjectDetail(projectId);

  const { tasks, archiveTasksCount, tasksLoaded } = useSelector(
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
        loadTasksAction(
          projectId,
          `?archive=false&boardId=null&offset=${paginationOffset}`
        )
      );
  }, [project, paginationOffset]);

  return (
    <>
      <div className="page-header flex-wrap">
        <h4>
          {project.name} / {i18n.t("task.backlog")}
        </h4>
      </div>

      <div className="row">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead>
                    <tr>
                      <th> # </th>
                      <th> First name </th>
                      <th> Progress </th>
                      <th> Amount </th>
                      <th> Deadline </th>
                    </tr>
                  </thead>

                  <tbody>
                    {tasksLoaded && tasks.length > 0 ? (
                      tasks.map((task) => <TaskTableItem task={task} />)
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center">
                          {i18n.t("label.noRecords")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {!tasksLoaded && <Loader />}
            </div>
            {renderPagination()}
          </div>
        </div>
        {renderModal()}
      </div>
    </>
  );
}
