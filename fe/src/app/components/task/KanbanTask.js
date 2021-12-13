import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Draggable } from "react-beautiful-dnd";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Trans } from "react-i18next";
import { useHistory } from "react-router-dom";

import { loadTaskDetailAction } from "./../../reducers/task/taskReducer";
import { levels } from "./../../models/task/priority";
import { getFullName, getShortName } from "../../service/user/user.service";

export default function KanbanTask({ task, index }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const now = new Date();

  const { user: currentUser } = useSelector(
    (state) => state.currentUserReducer
  );

  const handleClick = () => {
    dispatch(loadTaskDetailAction(task.projectId, task.id));
    history.push({
      search: `?ukol=${task.id}`,
    });
  };

  function renderBadget() {
    switch (task.priority.toString()) {
      case Object.keys(levels)[0]:
        return (
          <OverlayTrigger
            overlay={
              <Tooltip id="tooltip-disabled">
                <Trans>{levels[1]}</Trans>
              </Tooltip>
            }
          >
            <div className="badge badge-pill badge-success">
              <i className="mdi mdi-14px mdi-chevron-down"></i>
            </div>
          </OverlayTrigger>
        );
      case Object.keys(levels)[1]:
        return (
          <OverlayTrigger
            overlay={
              <Tooltip id="tooltip-disabled">
                <Trans>{levels[2]}</Trans>
              </Tooltip>
            }
          >
            <div className="badge badge-pill badge-info">
              <i className="mdi mdi-14px mdi-trending-neutral"></i>
            </div>
          </OverlayTrigger>
        );
      case Object.keys(levels)[2]:
        return (
          <OverlayTrigger
            overlay={
              <Tooltip id="tooltip-disabled">
                <Trans>{levels[3]}</Trans>
              </Tooltip>
            }
          >
            <div className="badge badge-pill badge-primary">
              <i className="mdi mdi-14px mdi-chevron-up"></i>
            </div>
          </OverlayTrigger>
        );
      case Object.keys(levels)[3]:
        return (
          <OverlayTrigger
            overlay={
              <Tooltip id="tooltip-disabled">
                <Trans>{levels[4]}</Trans>
              </Tooltip>
            }
          >
            <div className="badge badge-pill badge-warning">
              <i className="mdi mdi-14px mdi-chevron-double-up"></i>
            </div>
          </OverlayTrigger>
        );
      case Object.keys(levels)[4]:
        return (
          <OverlayTrigger
            overlay={
              <Tooltip id="tooltip-disabled">
                <Trans>{levels[5]}</Trans>
              </Tooltip>
            }
          >
            <div className="badge badge-pill badge-danger">
              <i className="mdi mdi-14px mdi-alert-outline"></i>
            </div>
          </OverlayTrigger>
        );
      default:
        break;
    }
    return (
      <div className="badge badge-pill badge-danger">
        <i className="mdi mdi-14px mdi-alert-outline"></i>
      </div>
    );
  }

  return (
    <Draggable draggableId={`draggableTask-${task.id}`} index={index}>
      {(provided) => (
        <div
          className="mt-2 board-portlet"
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          onClick={handleClick}
        >
          <ul id="portlet-card-list-1" className="portlet-card-list">
            <li className="portlet-card">
              {/* <ProgressBar variant={`${props.task.progressVariant}`} now={25}/> */}
              <div className="d-flex justify-content-between w-100">
                {task.deadline && (
                  <p
                    className={
                      task.deadline && now > new Date(task.deadline)
                        ? "task-date text-danger"
                        : "task-date"
                    }
                  >
                    {task.deadline &&
                      new Intl.DateTimeFormat("cs-CZ", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      }).format(new Date(task.deadline))}
                  </p>
                )}

                {/* <Dropdown variant="p-0" alignRight>
                  <Dropdown.Toggle variant="dropdown-toggle p-0">
                    <i className="mdi mdi-dots-vertical"></i>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item>
                      <Trans>Edit</Trans>
                    </Dropdown.Item>
                    <Dropdown.Item>
                      <Trans>Delete</Trans>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown> */}
              </div>
              <div>
                <h4 className="text-dark">{task.title}</h4>
              </div>
              <div className="">
                {task.solver && (
                  <span
                    className={`text-avatar ${
                      currentUser.id === task.solver.id ? "highlited" : ""
                    }`}
                  >
                    <OverlayTrigger
                      overlay={
                        <Tooltip id="tooltip-disabled">
                          {getFullName(task.solver)}
                        </Tooltip>
                      }
                    >
                      <span>{getShortName(task.solver)}</span>
                    </OverlayTrigger>
                  </span>
                )}
              </div>
              <div className="d-flex justify-content-between">
                {renderBadget()}

                {task.isCompleted && (
                  <i className="mdi mdi-checkbox-marked-circle-outline text-primary mdi-24px"></i>
                )}
                {/* <p className="due-date">{this.props.task.dueDate}</p> */}
              </div>
            </li>
          </ul>
        </div>
      )}
    </Draggable>
  );
}
