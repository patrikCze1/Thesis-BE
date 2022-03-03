import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Chart } from "react-google-charts";
import Select from "react-select";
import ReactDatePicker from "react-datepicker";
import { CSVLink } from "react-csv";

import Loader from "./../common/Loader";
import { useTranslation, Trans } from "react-i18next";
import {
  formatSecondsToString,
  getSecondsDiff,
} from "../../service/date/date.service";
import {
  loadMyTimeTracksAction,
  loadAllTimeTracksAction,
} from "../../reducers/timeTrack/timeTrack.reducer";
import { getFullName } from "../../service/user/user.service";
import { loadUsersAction } from "../../reducers/user/userReducer";
import { loadProjectsAction } from "../../reducers/project/project.reducer";
import { hasRole } from "../../service/role.service";
import { ROLES } from "../../../utils/enum";
import TimeTrackListItem from "./TimeTrackListItem";
import { getTrackDatesByProjectForChart } from "../../service/project/project.service";

const csvHaders = [
  { label: "Název", key: "name" },
  { label: "Začátek", key: "beginAt" },
  { label: "Konec", key: "endAt" },
  { label: "Jméno", key: "firstName" },
  { label: "Příjmení", key: "lastName" },
  { label: "Projekt", key: "project" },
  { label: "Počet hodin", key: "hours" },
  { label: "Hodiny a minuty", key: "hoursMinutes" },
];

export default function ReportScreen() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { projects } = useSelector((state) => state.projectReducer);
  const { tracks } = useSelector((state) => state.timeTrackReducer);
  const { users } = useSelector((state) => state.userReducer);
  const { user: currentUser } = useSelector(
    (state) => state.currentUserReducer
  );
  const isManagement = hasRole(
    [ROLES.ADMIN, ROLES.MANAGEMENT],
    currentUser.roles
  );
  console.log("tracks", tracks);
  const [groupedTracks, setGroupedTracks] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredProject, setFilteredProject] = useState();
  const [filteredUser, setFilteredUser] = useState();
  const [totalHours, setTotalHours] = useState(0);
  const [tracksByProject, setTracksByProject] = useState([]);
  const csvData = useRef([]);
  const projectNames = useRef({});

  console.log("tracksByProject", tracksByProject);
  useEffect(() => {
    if (isManagement) {
      if (fromDate && toDate)
        dispatch(
          loadAllTimeTracksAction(
            fromDate,
            toDate,
            filteredUser?.value,
            filteredProject?.value
          )
        );
    } else {
      if (fromDate && toDate)
        dispatch(
          loadMyTimeTracksAction(0, 10000000, true, false, fromDate, toDate)
        );
    }
  }, [toDate, filteredUser, filteredProject]);

  useEffect(() => {
    prepareData(tracks);
    csvData.current = tracks.map((track) => {
      const seconds = getSecondsDiff(track.beginAt, track.endAt);
      const hours = seconds / (60 * 60);
      return {
        name: track.name,
        beginAt:
          track.beginAt &&
          new Intl.DateTimeFormat("cs-CZ", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }).format(new Date(track.beginAt)),
        endAt:
          track.endAt &&
          new Intl.DateTimeFormat("cs-CZ", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }).format(new Date(track.endAt)),
        firstName: track.user?.firstName,
        lastName: track.user?.lastName,
        project: projectNames.current[track.projectId],
        hours: hours.toFixed(2),
        hoursMinutes: formatSecondsToString(seconds, false),
      };
    });
  }, [tracks]);

  useEffect(() => {
    if (isManagement) {
      dispatch(loadUsersAction());
    }
    dispatch(loadProjectsAction());
  }, []);

  useEffect(() => {
    for (const project of projects) {
      projectNames.current[project.id] = project.name;
    }
  }, [projects]);

  const prepareData = (tracks) => {
    const tracksArr = tracks.reduce((tracks, track) => {
      const date = track.beginAt.split("T")[0];
      if (!tracks[date]) {
        tracks[date] = [];
      }
      tracks[date].push(track);
      return tracks;
    }, {});

    let totalHours = 0;
    const groupTracks = Object.keys(tracksArr).map((date) => {
      let total = 0;
      tracksArr[date].forEach((track) => {
        total += getSecondsDiff(track.beginAt, track.endAt);
      });
      const hours = total / (60 * 60);
      totalHours += hours;

      return [
        new Intl.DateTimeFormat("cs-CZ", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        }).format(new Date(date)),
        hours,
        formatSecondsToString(total, false) + " h",
      ];
    });

    console.log("groupTracks", groupTracks);
    setGroupedTracks(groupTracks);
    setTotalHours(totalHours.toFixed(2));

    setTracksByProject(getTrackDatesByProjectForChart(tracks, projects));
    setIsLoaded(true);
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setFromDate(start);
    setToDate(end);
    setIsLoaded(false);
  };
  const handleFilterProjectChange = (val) => {
    setFilteredProject(val);
  };
  const handleFilterUserChange = (val) => {
    setFilteredUser(val);
  };

  return (
    <div className="row">
      <div className="col-md-12">
        <div className="page-header">
          <h4>
            <Trans>menu.report</Trans>
          </h4>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-baseline">
              {isManagement && (
                <div className="form-group mb-2">
                  <div className="form-check">
                    <label className="form-check-label">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        onClick={() => setShowFilters(!showFilters)}
                        value={showFilters}
                      />
                      <i className="input-helper"></i>
                      <Trans>track.showFilters</Trans>
                    </label>
                  </div>
                </div>
              )}
              {csvData.current.length > 0 && (
                <div className="ml-auto">
                  <CSVLink
                    data={csvData.current}
                    headers={csvHaders}
                    filename={"záznamy.csv"}
                    className="btn btn-link btn-icon-text"
                  >
                    <i className="mdi mdi-download btn-icon-pretend va-middle mr-1"></i>
                    <Trans>label.download</Trans>
                  </CSVLink>
                </div>
              )}
            </div>
            <div className="row track-report-filter-form">
              <div className="form-group col-sm-4">
                <ReactDatePicker
                  selected={fromDate}
                  onChange={handleDateChange}
                  startDate={fromDate}
                  endDate={toDate}
                  selectsRange
                  className="form-control"
                  placeholderText={t("track.selectDate")}
                  locale="cs"
                />
              </div>
              {showFilters && (
                <>
                  <div className="form-group col-sm-4 react-select-wrapper">
                    <Select
                      options={projects.map((project) => ({
                        value: project.id,
                        label: project.name,
                      }))}
                      onChange={handleFilterProjectChange}
                      value={filteredProject}
                      isClearable
                      placeholder={t("track.selectProject")}
                    />
                  </div>
                  <div className="form-group col-sm-4 react-select-wrapper">
                    <Select
                      options={users.map((user) => ({
                        value: user.id,
                        label: getFullName(user),
                      }))}
                      onChange={handleFilterUserChange}
                      value={filteredUser}
                      isClearable
                      placeholder={t("track.selectUser")}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {!isLoaded && toDate && <Loader />}
      {isLoaded && fromDate && toDate ? (
        <>
          <div className="col-md-12 mt-3">
            <div className="card">
              <div className="card-body">
                <h2 className="card-title">
                  {`${t("track.workedHours")}: ${formatSecondsToString(
                    totalHours * 3600,
                    false
                  )} h (${totalHours})`}
                </h2>
                {groupedTracks.length > 0 ? (
                  <Chart
                    width={"100%"}
                    // height={"400px"}
                    chartType="ColumnChart" //Bar
                    loader={<Loader />}
                    data={[
                      [
                        { label: t("track.date"), type: "string" },
                        { label: t("track.hours"), type: "number" },
                        { type: "string", role: "tooltip" },
                      ],
                      ...groupedTracks,
                    ]}
                    options={{
                      chart: {
                        title: `${t("track.workedHours")}: ${totalHours}`,
                      },
                      vAxis: {
                        // title: t("track.hours"),
                        minValue: 0,
                      },
                      hAxis: {
                        title: t("track.date"),
                        minValue: 0,
                      },
                      legend: { position: "none" },
                    }}
                  />
                ) : (
                  <p className="text-center mb-0">
                    <Trans>track.noRecords</Trans>.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-4 mt-3">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">
                  <Trans>track.timesByProject</Trans>
                </h4>
                {tracksByProject.length > 0 ? (
                  <Chart
                    width={"100%"}
                    height={"300px"}
                    chartType="PieChart"
                    loader={<Loader />}
                    data={[
                      [
                        { label: t("track.date"), type: "string" },
                        { label: "data", type: "number" },
                        {
                          type: "string",
                          role: "tooltip",
                        },
                      ],
                      ...tracksByProject,
                    ]}
                    options={{
                      legend: { position: "bottom" },
                    }}
                    // chartWrapperParams={{ view: { columns: [0, 1] } }}
                    chartPackages={["corechart"]}
                  />
                ) : (
                  <p className="text-center">
                    <Trans>track.noRecords</Trans>.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-8 mt-3">
            <div className="card">
              <div className="card-body">
                <div className="track-list">
                  {isLoaded && fromDate && toDate > 0 && (
                    <>
                      <div className="d-flex">
                        <div className="wrapper">
                          <h4 className="card-title">
                            <Trans>track.records</Trans>
                          </h4>
                        </div>
                      </div>
                      {tracks.length > 0 ? (
                        tracks.map((track) => (
                          <TimeTrackListItem
                            track={track}
                            key={track.id}
                            projects={projects}
                            isEditable={false}
                            showUser={true}
                            projectName={projectNames.current[track.projectId]}
                          />
                        ))
                      ) : (
                        <p className="text-center">
                          <Trans>track.noRecords</Trans>.
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="col-md-12 mt-3">
          <p className="text-center mt-4">{t("track.chooseDate")}.</p>
        </div>
      )}
    </div>
  );
}
