import React, { useState, useRef } from "react";
import { Dropdown, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import DatePicker from "react-datepicker";

import {
  formatSecondsToString,
  getMonthDayTime,
  getSecondsDiff,
} from "../../service/date/date.service";
import { getFullName, getShortName } from "../../service/user/user.service";

export default function TimeTrackListItem({
  track,
  isEditable = true,
  projects,
  deleteTrack,
  editTrack,
  onClickCopy,
  showUser = false,
}) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ ...track });
  let startVal = new Date(track.beginAt);
  let endVal = new Date(track.endAt);
  let dateEdited = false;

  const handleSave = (data = null) => {
    if (
      (isEditable &&
        (formData.name !== track.name ||
          formData.projectId !== track.projectId ||
          dateEdited)) ||
      data?.name !== track.name ||
      data?.projectId !== track.projectId
    ) {
      if (data)
        editTrack({
          ...data,
          beginAt: startVal,
          endAt: endVal,
        });
      else
        editTrack({
          ...formData,
          beginAt: startVal,
          endAt: endVal,
        });
      dateEdited = false;
    }
  };

  const handleChange = (prop, val, save) => {
    if (isEditable) {
      const data = { ...formData, [prop]: val };
      setFormData(data);
      if (save) handleSave(data);
    }
  };

  const handleDelete = () => {
    deleteTrack(track.id);
  };

  const handleDateChange = (val, isStart = true) => {
    if (isStart) {
      if (startVal.getTime() !== val.getTime()) dateEdited = true;
      setFormData({ ...formData, start: val });
      startVal = val;
    } else {
      if (endVal.getTime() !== val.getTime()) dateEdited = true;
      setFormData({ ...formData, end: val });
      endVal = val;
    }

    if (val && dateEdited) handleSave();
  };

  return (
    <div className={`track-item ${!isEditable && "disabled"}`}>
      {showUser && (
        <div className="track-info mr-2">
          <OverlayTrigger
            overlay={
              <Tooltip id="tooltip-disabled">{getFullName(track.user)}</Tooltip>
            }
          >
            <span className="text-avatar">{getShortName(track.user)}</span>
          </OverlayTrigger>
        </div>
      )}
      <div className="track-info track-info-big">
        <input
          type="text"
          className="form-control"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          onBlur={() => {
            if (formData.name != track.name) handleSave();
          }}
          name="name"
          disabled={!isEditable}
          title={formData.name}
        />
      </div>

      <div className="track-info">
        <select
          className="form-control"
          name="projectId"
          value={formData.projectId}
          onChange={(e) => handleChange("projectId", e.target.value, true)}
          disabled={!isEditable}
          title={track?.project?.name}
        >
          <option value="null">{t("track.selectProject")}</option>
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
      <div className="track-item-dates track-info">
        <DatePicker
          className="form-control"
          locale="cs"
          selected={startVal}
          onChange={(val) => handleDateChange(val, true)}
          timeFormat="p"
          timeIntervals={1}
          dateFormat="p"
          showTimeSelect
          disabled={!isEditable}
          withPortal
          title={getMonthDayTime(startVal)}
        />
        <DatePicker
          className="form-control"
          locale="cs"
          selected={endVal}
          onChange={(val) => handleDateChange(val, false)}
          timeFormat="p"
          timeIntervals={1}
          dateFormat="p"
          showTimeSelect
          disabled={!isEditable}
          withPortal
          title={getMonthDayTime(endVal)}
        />
      </div>
      {/* {isEditable && (
        <div className="track-info">
          <button
            type="button"
            onClick={() => onClickCopy(track)}
            className="btn btn-outline-secondary btn-rounded btn-icon"
          >
            <i className="mdi mdi-play mdi-24px"></i>
          </button>
        </div>
      )} */}
      <div className="track-info track-info-total">
        {formatSecondsToString(
          getSecondsDiff(track.beginAt, track.endAt),
          false
        )}
        {isEditable && (
          <Dropdown>
            <Dropdown.Toggle variant="btn btn-icon">
              <i className="mdi mdi-dots-vertical"></i>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={handleDelete}>
                {t("delete")}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        )}
      </div>
    </div>
  );
}
