import React from "react";
import { useInitShowTask } from "../../../hooks/task";

export default function TaskArchiveItem({ task }) {
  const { click } = useInitShowTask(task);

  return (
    <a
      href="!#"
      className="tickets-card row mx-0"
      onClick={(e) => {
        e.preventDefault();
        click();
      }}
    >
      <div className="tickets-details col-lg-7">
        <div className="wrapper">
          <h5>
            {task.number} - {task.title}
          </h5>
        </div>
        <div className="wrapper text-muted d-none d-md-block">
          <span>Assigned to</span>
          {/* <img className="assignee-avatar" src={ require("../../assets/images/faces/face18.jpg") } alt="profile" /> */}
          <span>Olivia Cross</span>
          <span>
            <i className="mdi mdi-clock-outline"></i>04:23AM
          </span>
        </div>
      </div>
      <div className="ticket-float col-lg-3 col-sm-6 pr-0">
        {/* <img className="img-xs rounded-circle" src={ require("../../assets/images/faces/face14.jpg") } alt="profile" /> */}
        <span className="text-muted">Frank Briggs</span>
      </div>
      <div className="ticket-float col-lg-2 col-sm-6">
        <i className="category-icon mdi mdi-folder-outline"></i>
        <span className="text-muted">Wireframe</span>
      </div>
    </a>
  );
}
