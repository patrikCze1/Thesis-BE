import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { Trans, useTranslation } from "react-i18next";
import { Form } from "react-bootstrap";
import DatePicker from "react-datepicker";

import {
  createTimeTrackAction,
  startTimeTrackAction,
  stopTimeTrackAction,
  editTimeTrackAction,
} from "../../reducers/timeTrack/timeTrack.reducer";
import DeltaTimer from "./DeltaTimer";

export default function Starter({ activeTrack, projects }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [isTracking, setIsTracking] = useState(false);
  const [isModeTracking, setIsModeTracking] = useState(true);
  const [trackData, setTrackData] = useState({ name: "", projectId: "" });
  const [manualStart, setManualStart] = useState(new Date());
  const [manualEnd, setManualEnd] = useState(new Date());
  const valChangedRef = useRef(false);

  useEffect(() => {
    if (activeTrack) {
      console.log("effect activeTrack", activeTrack);
      setIsTracking(true);
      setTrackData({
        name: activeTrack.name,
        projectId: activeTrack.projectId,
      });
    } else setIsTracking(false);
  }, [activeTrack]);

  const handleStartStop = (e) => {
    e.preventDefault();
    trackData.projectId = trackData.projectId
      ? parseInt(trackData.projectId)
      : null;

    if (isModeTracking) {
      if (activeTrack) {
        dispatch(stopTimeTrackAction({ ...activeTrack, ...trackData }));
        setTrackData({ name: "", projectId: "" });
      } else dispatch(startTimeTrackAction(trackData));
    } else {
      dispatch(
        createTimeTrackAction({
          ...trackData,
          beginAt: manualStart,
          endAt: manualEnd,
        })
      );
      setTrackData({ name: "", projectId: "" });
    }
  };

  const handleChangeMode = (e, mode) => {
    e.preventDefault();
    if (!activeTrack) setIsModeTracking(mode);
  };

  const handleSave = (data = null) => {
    console.log(
      "activeTrack && valChangedRef.current",
      activeTrack && valChangedRef.current
    );
    console.log("trackData", trackData);
    console.log("data", data);
    console.log("activeTrack", activeTrack);
    if (activeTrack && valChangedRef.current) {
      if (data) {
        dispatch(
          editTimeTrackAction({
            ...activeTrack,
            ...data,
          })
        );
      } else {
        dispatch(
          editTimeTrackAction({
            ...activeTrack,
            ...trackData,
          })
        );
      }
      valChangedRef.current = false;
    }
  };

  const handleInputChange = (e, save = false) => {
    const { name, value } = e.target;
    const data = { ...trackData, [name]: value };
    setTrackData(data);
    console.log("data save", data, save);
    if (
      (name === "name" && value !== trackData.name) ||
      (name === "projectId" && value != trackData.projectId)
    )
      valChangedRef.current = true;

    if (save) handleSave(data);
  };

  const handleDateChange = (val, isStart = true) => {
    if (isStart) {
      setManualStart(val);
    } else {
      setManualEnd(val);
    }
  };

  return (
    <div className="forms-sample tracker-form">
      <div className="tracker-group">
        <div className="tracker-name tracker-item">
          <Form.Control
            type="text"
            name="name"
            id="exampleInputUsername1"
            placeholder={t("track.whatAreYouDoing")}
            value={trackData?.name}
            onChange={(e) => handleInputChange(e, false)}
            onBlur={() => handleSave(null)}
          />
        </div>
        <div className="tracker-project tracker-item">
          <select
            className="form-control"
            name="projectId"
            value={trackData?.projectId}
            onChange={(e) => {
              handleInputChange(e, true);
            }}
          >
            <option value="">{t("project.title")}</option>
            {projects &&
              projects.map((project, i) => {
                return (
                  <option value={project.id} key={i}>
                    {project.name}
                  </option>
                );
              })}
          </select>
        </div>
      </div>
      <div className="tracker-group with-dates">
        {!isModeTracking && (
          <div className="tracker-item manual-dates">
            <DatePicker
              className="form-control"
              locale="cs"
              selected={manualStart}
              onChange={(val) => handleDateChange(val, true)}
              timeFormat="p"
              timeIntervals={1}
              dateFormat="p"
              showTimeSelect
            />
            <DatePicker
              className="form-control"
              locale="cs"
              selected={manualEnd}
              onChange={(val) => handleDateChange(val, false)}
              timeFormat="p"
              timeIntervals={1}
              dateFormat="p"
              showTimeSelect
            />
          </div>
        )}
        <div className="delta-tracker tracker-item">
          <DeltaTimer start={activeTrack ? activeTrack.beginAt : null} />
        </div>

        <div className="tracker-button tracker-item">
          <button
            type="button"
            onClick={handleStartStop}
            className="btn btn-primary mr-2"
          >
            <Trans>
              {/* {isModeTracking ? (isTracking ? "Stop" : "Start") : "Add"} */}
              {isModeTracking ? (
                isTracking ? (
                  <i className="mdi mdi-stop mdi-24px"></i>
                ) : (
                  <i className="mdi mdi-play mdi-24px"></i>
                )
              ) : (
                "Add"
              )}
            </Trans>
          </button>
          <div className="tracker-modes">
            <a
              href="#"
              className={`mode-btn ${isModeTracking ? "active" : ""}`}
              onClick={(e) => handleChangeMode(e, true)}
            >
              <i className="fa fa-clock-o"></i>
            </a>
            <a
              href="#"
              className={`mode-btn ${isModeTracking ? "" : "active"}`}
              onClick={(e) => handleChangeMode(e, false)}
            >
              <i className="fa fa-pencil-square-o"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
