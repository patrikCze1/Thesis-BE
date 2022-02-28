import React from "react";
import i18n from "../../../../i18n";
import Loader from "../../common/Loader";
import TaskTableItem from "./TaskTableItem";

export default function TaskTable({ tasksLoaded, tasks, renderPagination }) {
  return (
    <div className="card">
      <div className="card-body">
        {tasks.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead>
                <tr>
                  <th> # </th>
                  <th> {i18n.t("label.name")} </th>
                  <th> {i18n.t("task.priority")} </th>
                  <th> {i18n.t("task.estimation")} </th>
                  <th> {i18n.t("task.deadline")} </th>
                </tr>
              </thead>

              <tbody>
                {tasksLoaded &&
                  tasks.map((task) => (
                    <TaskTableItem task={task} key={task.id} />
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center">{i18n.t("label.noRecords")}</p>
        )}
        {!tasksLoaded && <Loader />}
      </div>
      {renderPagination()}
    </div>
  );
}
