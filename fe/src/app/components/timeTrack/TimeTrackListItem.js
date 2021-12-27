import React, { useState, useRef } from "react";
import { Dropdown, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import DatePicker from "react-datepicker";

import {
  formatSecondsToString,
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
  projectName = null,
}) {
  const { t } = useTranslation();
  const [start, setStart] = useState(new Date(track.beginAt));
  const [end, setEnd] = useState(new Date(track.endAt));
  const nameRef = useRef(track.name);
  const projectIdRef = useRef(track.projectId);
  let startVal = new Date(track.beginAt);
  let endVal = new Date(track.endAt);
  let dateEdited = false;

  const handleInputChange = (e) => {
    nameRef.current = e.target.value;
  };

  const handleProjectChange = (e) => {
    const { value } = e.target;
    projectIdRef.current = value;
    handleSave();
  };

  const handleSave = () => {
    if (
      nameRef.current !== track.name ||
      projectIdRef.current !== track.projectId ||
      dateEdited
    ) {
      editTrack({
        ...track,
        projectId: projectIdRef.current,
        name: nameRef.current,
        beginAt: startVal,
        endAt: endVal,
      });
      dateEdited = false;
    }
  };

  const handleDelete = () => {
    deleteTrack(track.id);
  };

  const handleDateChange = (val, isStart = true) => {
    if (isStart) {
      if (startVal.getTime() !== val.getTime()) dateEdited = true;
      setStart(val);
      startVal = val;
    } else {
      if (endVal.getTime() !== val.getTime()) dateEdited = true;
      setEnd(val);
      endVal = val;
    }

    if (val && dateEdited) handleSave();
  };

  return (
    <div className="track-item">
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
          value={nameRef.current}
          onChange={handleInputChange}
          onBlur={handleSave}
          name="name"
          disabled={!isEditable}
        />
      </div>
      <div className="track-info">
        <select
          className="form-control"
          name="projectId"
          value={projectIdRef.current}
          onChange={handleProjectChange}
          disabled={!isEditable}
        >
          {!isEditable ? (
            <option>{projectName || ""}</option>
          ) : (
            projects &&
            projects.map((project, i) => {
              return (
                <option value={project.id} key={i}>
                  {project.name}
                </option>
              );
            })
          )}
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
