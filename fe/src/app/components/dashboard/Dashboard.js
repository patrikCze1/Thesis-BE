import React, { useEffect, useState, useRef } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useHistory } from "react-router-dom";
import Chart from "react-google-charts";

import {
  loadNotificationsAction,
  setSeenAction,
} from "../../reducers/notification/notificationReducer";
import { loadTasksAction } from "../../reducers/task/taskReducer";
import {
  formatSecondsToString,
  getFirstDayOfWeek,
  getMonthDayTime,
  getSecondsDiff,
  isDateToday,
} from "../../service/date/date.service";
import Loader from "./../common/Loader";
import NotificationListItem from "./../notification/NotificationListItem";
import { levels } from "./../../models/task/priority";
import { routeEnum } from "./../../enums/navigation/navigation";
import { loadMyTimeTracksAction } from "../../reducers/timeTrack/timeTrack.reducer";

export default function Dashboard() {
  const dispatch = useDispatch();
  const history = useHistory();
  const { t } = useTranslation();

  const { notifications, loaded: notificationsLoaded } = useSelector(
    (state) => state.notificationReducer
  );
  const { tasks, tasksLoaded } = useSelector((state) => state.taskReducer);
  const { user } = useSelector((state) => state.currentUserReducer);
  const { tracks } = useSelector((state) => state.timeTrackReducer);
  const [tracksToday, setTracksToday] = useState([]);
  const [weekTracksByProject, setWeekTracksByProject] = useState([]);
  const [todayTracksByProject, setTodayTracksByProject] = useState([]);
  const secondsWorkedTodayRef = useRef(0);
  const secondsWorkedThisWeekRef = useRef(0);
  const now = new Date();

  useEffect(() => {
    dispatch(loadNotificationsAction(0, 10));
    dispatch(loadTasksAction(-1, `?solverId=${user.id}`));

    const firstDayOfWeek = getFirstDayOfWeek(new Date());
    firstDayOfWeek.setHours(0, 0, 0);

    dispatch(loadMyTimeTracksAction(firstDayOfWeek, now));
  }, []);

  useEffect(() => {
    let tempTodayTracks = [];
    let totalSeconds = 0;
    let totalSecondsToday = 0;
    for (const track of tracks) {
      totalSeconds += getSecondsDiff(track.beginAt, track.endAt);

      if (isDateToday(track.beginAt)) {
        tempTodayTracks.push(track);
        totalSecondsToday += getSecondsDiff(track.beginAt, track.endAt);
      }
    }
    setTracksToday(tempTodayTracks);

    secondsWorkedThisWeekRef.current = totalSeconds;
    secondsWorkedTodayRef.current = totalSecondsToday;
    groupTracks();
  }, [tracks]);

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

  const groupTracks = () => {
    const tracksObj = tracks.reduce((tracks, track) => {
      if (!tracks[track.project?.name || t("track.withoutProject")]) {
        tracks[track.project?.name || t("track.withoutProject")] = [];
      }
      tracks[track.project?.name || t("track.withoutProject")].push(track);
      return tracks;
    }, {});

    const weekTracks = Object.keys(tracksObj).map((project) => {
      let total = 0;
      tracksObj[project].forEach((track) => {
        total += getSecondsDiff(track.beginAt, track.endAt);
      });
      const hours = total / (60 * 60);

      return [project, hours];
    });

    const todayTracks = Object.keys(tracksObj).map((project) => {
      let total = 0;
      tracksObj[project].forEach((track) => {
        if (isDateToday(track.beginAt))
          total += getSecondsDiff(track.beginAt, track.endAt);
      });
      const hours = total / (60 * 60);

      return [project, hours];
    });

    setWeekTracksByProject(weekTracks);
    setTodayTracksByProject(todayTracks);
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
              className="text-black mt-3 mb-0 d-inline-block h6"
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
                    taskComponents.length > 0 ? (
                      taskComponents
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center">
                          {t("label.noRecords")}
                        </td>
                      </tr>
                    )
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

      <div className="col-12 grid-margin stretch-card">
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between">
              <h4 className="card-title">
                <Trans>track.workingRecords</Trans>
              </h4>
            </div>

            <div className="row">
              <div className="col-md-6">
                <h4 className="d-flex justify-content-between">
                  <span>
                    <Trans>date.today</Trans>
                  </span>
                  <small>
                    {formatSecondsToString(
                      secondsWorkedTodayRef.current,
                      false
                    )}
                  </small>
                </h4>

                {todayTracksByProject.length > 0 && (
                  <>
                    <Chart
                      width={"500px"}
                      height={"300px"}
                      chartType="PieChart"
                      loader={<Loader />}
                      data={[
                        [t("track.date"), t("track.hours")],
                        ...todayTracksByProject,
                      ]}
                      options={{
                        legend: { position: "bottom" },
                      }}
                      rootProps={{ "data-testid": "1" }}
                    />
                    {/* <div>
                      {todayTracksByProject.length > 0 &&
                        todayTracksByProject.map((tracks, i) => (
                          <div key={i}>
                            {tracks[0]} - {tracks[1]}
                          </div>
                        ))}
                    </div> */}
                  </>
                )}
              </div>

              <div className="col-md-6">
                <h4 className="d-flex justify-content-between">
                  <span>
                    <Trans>date.thisWeek</Trans>
                  </span>
                  <small>
                    {formatSecondsToString(
                      secondsWorkedThisWeekRef.current,
                      false
                    )}
                  </small>
                </h4>

                {weekTracksByProject.length > 0 && (
                  <>
                    <Chart
                      width={"100%"}
                      height={"300px"}
                      chartType="PieChart"
                      loader={<Loader />}
                      data={[
                        [t("track.date"), t("track.hours")],
                        ...weekTracksByProject,
                      ]}
                      options={{
                        legend: { position: "bottom" },
                      }}
                      rootProps={{ "data-testid": "1" }}
                    />
                    {/* <div>
                      {weekTracksByProject.length > 0 &&
                        weekTracksByProject.map((tracks, i) => (
                          <div key={i}>
                            {tracks[0]} - {tracks[1]}
                          </div>
                        ))}
                    </div> */}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
