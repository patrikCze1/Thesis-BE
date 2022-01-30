import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Draggable } from "react-beautiful-dnd";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Trans } from "react-i18next";
import { useHistory } from "react-router-dom";

import { loadTaskDetailAction } from "./../../reducers/task/taskReducer";
import { TASK_PRIORITY } from "./../../../utils/enum";
import { getFullName, getShortName } from "../../service/user/user.service";

export default function KanbanTask({ task, index }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const now = new Date();

  const { user: currentUser } = useSelector(
    (state) => state.currentUserReducer
  );
  const { project } = useSelector((state) => state.projectReducer);

  const handleClick = () => {
    dispatch(loadTaskDetailAction(task.projectId, task.id));
    history.push({
      search: `?ukol=${task.id}`,
    });
  };

  function renderBadget() {
    switch (task.priority.toString()) {
      case Object.keys(TASK_PRIORITY)[0]:
        return (
          <OverlayTrigger
            overlay={
              <Tooltip id="tooltip-disabled">
                <Trans>{TASK_PRIORITY[1]}</Trans>
              </Tooltip>
            }
          >
            <div className="badge badge-pill badge-success">
              <i className="mdi mdi-14px mdi-chevron-down"></i>
            </div>
          </OverlayTrigger>
        );
      case Object.keys(TASK_PRIORITY)[1]:
        return (
          <OverlayTrigger
            overlay={
              <Tooltip id="tooltip-disabled">
                <Trans>{TASK_PRIORITY[2]}</Trans>
              </Tooltip>
            }
          >
            <div className="badge badge-pill badge-info">
              <i className="mdi mdi-14px mdi-trending-neutral"></i>
            </div>
          </OverlayTrigger>
        );
      case Object.keys(TASK_PRIORITY)[2]:
        return (
          <OverlayTrigger
            overlay={
              <Tooltip id="tooltip-disabled">
                <Trans>{TASK_PRIORITY[3]}</Trans>
              </Tooltip>
            }
          >
            <div className="badge badge-pill badge-primary">
              <i className="mdi mdi-14px mdi-chevron-up"></i>
            </div>
          </OverlayTrigger>
        );
      case Object.keys(TASK_PRIORITY)[3]:
        return (
          <OverlayTrigger
            overlay={
              <Tooltip id="tooltip-disabled">
                <Trans>{TASK_PRIORITY[4]}</Trans>
              </Tooltip>
            }
          >
            <div className="badge badge-pill badge-warning">
              <i className="mdi mdi-14px mdi-chevron-double-up"></i>
            </div>
          </OverlayTrigger>
        );
      case Object.keys(TASK_PRIORITY)[4]:
        return (
          <OverlayTrigger
            overlay={
              <Tooltip id="tooltip-disabled">
                <Trans>{TASK_PRIORITY[5]}</Trans>
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
  //todo pocet komentu + souboru
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
              <div
                className="d-flex progress"
                style={{ backgroundColor: task.colorCode, height: "5px" }}
              ></div>

              <div className="d-flex justify-content-between w-100">
                {task.deadline && (
                  <>
                    <p
                      className={
                        task.deadline && now > new Date(task.deadline)
                          ? "task-date text-danger"
                          : "task-date"
                      }
                    >
                      {task.deadline && now > new Date(task.deadline) && (
                        <i className="fa fa-exclamation-circle mr-1"></i>
                      )}
                      {task.deadline &&
                        new Intl.DateTimeFormat("cs-CZ", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        }).format(new Date(task.deadline))}
                    </p>
                    <small>{`${project.key && `${project.key}-`}${
                      task.number
                    }`}</small>
                  </>
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
              <div className="d-flex">
                <h5 className="text-dark">{task.title}</h5>
              </div>

              {task.commentsCount > 0 && (
                <>
                  <i className="fa fa-comments-o pr-1"></i>
                  {task.commentsCount}
                </>
              )}
              {task.attachmentsCount > 0 && (
                <>
                  <i className="fa fa-paperclip pr-1"></i>
                  {task.attachmentsCount}
                </>
              )}
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
