import React, { useEffect, useState } from "react";
import { Trans } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useHistory } from "react-router-dom";

import {
  loadNotificationsAction,
  setSeenAction,
} from "../../reducers/notification/notificationReducer";
import { loadTasksAction } from "../../reducers/task/taskReducer";
import { getMonthDayTime } from "../../service/date/date.service";
import Loader from "./../common/Loader";
import NotificationListItem from "./../notification/NotificationListItem";
import { levels } from "./../../models/task/priority";
import { routeEnum } from "./../../enums/navigation/navigation";

export default function Dashboard() {
  const dispatch = useDispatch();
  const history = useHistory();

  const { notifications, loaded: notificationsLoaded } = useSelector(
    (state) => state.notificationReducer
  );
  const { tasks, tasksLoaded } = useSelector((state) => state.taskReducer);
  const { user } = useSelector((state) => state.currentUserReducer);
  const now = new Date();
  useEffect(() => {
    dispatch(loadNotificationsAction(0, 10));
    dispatch(loadTasksAction(-1, `?solverId=${user.id}`));
  }, []);

  const handleClickNotification = (e, notification) => {
    e.preventDefault();
    if (notification.TaskNotification) {
      const { projectId, id } = notification.TaskNotification.task;
      history.push(`${routeEnum.PROJECTS}/${projectId}?ukol=${id}`);
    }
  };

  const handleSeenNotification = (e, id, notification) => {
    e.preventDefault();
    dispatch(setSeenAction(id, notification));
  };

  const notificationComponents = notifications.map((notification, i) => (
    <NotificationListItem
      key={i}
      notification={notification}
      onClick={(e) => handleClickNotification(e, notification)}
      setSeen={(e) => handleSeenNotification(e, notification.id, notification)}
    />
  ));

  const taskComponents = tasks.map((task, i) => {
    return (
      <tr key={i}>
        <td>
          <NavLink
            to={`${routeEnum.PROJECTS}/${task.projectId}/?ukol=${task.id}`}
            className="project-title"
          >
            {task.title}
          </NavLink>
        </td>
        <td>{task.projectId}</td>
        <td>
          <span className={`badge badge-prio-${task.priority}`}>
            <Trans>{levels[task.priority]}</Trans>
          </span>
        </td>
        <td className={now > new Date(task.deadline) ? "text-danger" : ""}>
          {getMonthDayTime(task.deadline)}
        </td>
      </tr>
    );
  });

  return (
    <div className="row">
      <div className="col-12">
        <div className="page-header flex-wrap">
          <h3 className="mb-0">
            <Trans>dashboard.title</Trans>
          </h3>
        </div>
      </div>
      <div className="col-12 grid-margin stretch-card">
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between">
              <h4 className="card-title">
                <Trans>Notifications</Trans>
              </h4>
            </div>

            {notificationsLoaded ? (
              notifications.length > 0 ? (
                notificationComponents
              ) : (
                <div className="text-center">
                  <Trans>label.noRecords</Trans>
                </div>
              )
            ) : (
              <Loader />
            )}
            <NavLink
              to={routeEnum.NOTIFICATIONS}
              className="text-black mt-3 mb-0 d-block h6"
            >
              <Trans>label.showAll</Trans>
              <i className="mdi mdi-chevron-right"></i>
            </NavLink>
          </div>
        </div>
      </div>
      <div className="col-lg-12 grid-margin stretch-card">
        <div className="card">
          <div className="card-body">
            <h4 className="card-title">
              <Trans>menu.tasks</Trans> ({taskComponents.length})
            </h4>
            <p className="card-description">
              <Trans>task.myTasks</Trans>
            </p>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>
                      <Trans>label.name</Trans>
                    </th>
                    <th>
                      <Trans>project.title</Trans>
                    </th>
                    {/* <th>
                      <Trans>task.state</Trans>
                    </th> */}
                    <th>
                      <Trans>task.priority</Trans>
                    </th>
                    <th>
                      <Trans>task.deadline</Trans>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tasksLoaded ? (
                    taskComponents
                  ) : (
                    <tr>
                      <td colSpan={4}>
                        <Loader />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
