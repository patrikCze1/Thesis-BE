import React from "react";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";

import { ROUTE } from "../../../utils/enum";
import DeltaTimer from "./DeltaTimer";

export default function NavigationActiveTtrack() {
  const history = useHistory();
  const { activeTrack } = useSelector((state) => state.timeTrackReducer);

  if (!activeTrack) return "";

  return (
    <div className="dropdown">
      <button
        className="nav-link count-indicator border-0 dropdown-toggle btn"
        onClick={() => history.push(ROUTE.TIME_TRACKS)}
      >
        <i className="mdi mdi-timer"></i>
        <span className="time">
          {activeTrack && <DeltaTimer start={activeTrack.beginAt} />}
        </span>
      </button>
    </div>
  );
}
