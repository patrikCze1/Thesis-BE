import React from "react";
import { NavLink } from "react-router-dom";
import { Trans } from "react-i18next";

import { routeEnum } from "../../enums/navigation/navigation";
import { levels } from "../../models/task/priority";
import { getMonthDayTime } from "../../service/date/date.service";

export default function TaskTableItem({ task }) {
  return (
    <tr>
      <td>
        <NavLink
          to={`${routeEnum.PROJECTS}/${task.projectId}/?ukol=${task.id}`}
          className="project-title p-0"
        >
          {task.title}
        </NavLink>
      </td>
      <td>
        <NavLink
          to={`${routeEnum.PROJECTS}/${task.projectId}`}
          className="project-title p-0"
        >
          {task.project && task.project.name}
        </NavLink>
      </td>
      <td>
        <span className={`badge badge-prio-${task.priority}`}>
          <Trans>{levels[task.priority]}</Trans>
        </span>
      </td>
      {/*todo and completed after deadline */}
      <td className={new Date() > new Date(task.deadline) ? "text-danger" : ""}>
        {getMonthDayTime(task.deadline)}
      </td>
    </tr>
  );
}
