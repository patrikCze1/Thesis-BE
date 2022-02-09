import React from "react";
import { NavLink } from "react-router-dom";
import { Trans } from "react-i18next";

import { ROUTE, TASK_PRIORITY } from "../../../utils/enum";
import { getDayMonthShort } from "../../service/date/date.service";

export default function TaskTableItem({ task }) {
  console.log("task", task);
  const now = new Date();

  return (
    <tr>
      <td>
        <NavLink
          to={`${ROUTE.PROJECTS}/${task.projectId}/?ukol=${task.id}`}
          className="project-title p-0"
        >
          {task.title}
        </NavLink>
      </td>
      <td>
        <NavLink
          to={`${ROUTE.PROJECTS}/${task.projectId}`}
          className="project-title p-0"
        >
          {task.project && task.project.name}
        </NavLink>
      </td>
      <td>
        <span className={`badge badge-prio-${task.priority}`}>
          <Trans>{TASK_PRIORITY[task.priority]}</Trans>
        </span>
      </td>

      {task.deadline ? (
        <>
          {task.completedAt ? (
            <td
              className={`task-date ${
                new Date(task.deadline) < new Date(task.completedAt)
                  ? "text-warning"
                  : ""
              }`}
            >
              {getDayMonthShort(new Date(task.deadline))}
            </td>
          ) : (
            <td
              className={
                task.deadline && now > new Date(task.deadline)
                  ? " text-danger"
                  : ""
              }
            >
              {getDayMonthShort(new Date(task.deadline))}
            </td>
          )}
        </>
      ) : (
        <td></td>
      )}
    </tr>
  );
}
