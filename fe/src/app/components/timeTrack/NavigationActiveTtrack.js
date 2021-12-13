import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { routeEnum } from "../../enums/navigation/navigation";
import DeltaTimer from "./DeltaTimer";
import { loadMyTimeTracksAction } from "../../reducers/timeTrack/timeTrack.reducer";
import { getFirstDayOfWeek } from "../../service/date/date.service";

export default function NavigationActiveTtrack() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { activeTrack } = useSelector((state) => state.timeTrackReducer);

  useEffect(() => {
    //todo duplicate
    const today = new Date();
    const firstDay = getFirstDayOfWeek(new Date());
    firstDay.setHours(0, 0, 0);
    // dispatch(loadMyTimeTracksAction(today, firstDay));
  }, []);

  if (!activeTrack) return "";

  return (
    <div className="dropdown">
      <button
        className="nav-link count-indicator border-0 dropdown-toggle btn"
        onClick={() => history.push(routeEnum.TIME_TRACKS)}
      >
        <i className="mdi mdi-timer"></i>
        <span className="time">
          {activeTrack && <DeltaTimer start={activeTrack.beginAt} />}
        </span>
      </button>
    </div>
  );
}
