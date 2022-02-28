import React from "react";
import { Trans } from "react-i18next";
import { NavLink } from "react-router-dom";

import { ROUTE, TASK_PRIORITY } from "../../../../utils/enum";
import { useInitShowTask } from "../../../hooks/task";
import {
  getDayMonthShort,
  getMonthDayTime,
} from "../../../service/date/date.service";
import { createRouteWithParams } from "../../../service/router.service";

export default function TaskTableItem({ task, view }) {
  const now = new Date();
  const { click } = useInitShowTask();

  const handleClick = (e) => {
    e.preventDefault();
    click(task);
  };

  let url = task.stageId
    ? createRouteWithParams(ROUTE.PROJECTS_BOARDS_DETAIL, {
        ":id": task.projectId,
        ":boardId": task.boardId,
      })
    : createRouteWithParams(ROUTE.PROJECTS_DETAIL_BACKLOG, {
        ":id": task.projectId,
      });

  if (view === "dashboard")
    return (
      <tr>
        <td>
          <NavLink to={url} className="project-title p-0">
            {task.name}
          </NavLink>
        </td>
        <td>
          <NavLink
            to={createRouteWithParams(ROUTE.PROJECTS_BOARDS, {
              ":id": task.projectId,
            })}
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

  return (
    <tr>
      <td> {task.number} </td>
      <td>
        <a href={`/upravit=${task.id}`} onClick={handleClick}>
          {task.name}
        </a>
      </td>
      <td>
        <span className={`badge badge-prio-${task.priority}`}>
          <Trans>{TASK_PRIORITY[task.priority]}</Trans>
        </span>
      </td>
      <td> {task.estimation ? `${task.estimation} h` : ""} </td>
      <td> {task.deadline && getMonthDayTime(new Date(task.deadline))} </td>
    </tr>
  );
}
