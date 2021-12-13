import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Trans } from "react-i18next";

import { loadProjectsAction } from "../../reducers/project/project.reducer";
import {
  deleteTimeTrackAction,
  editTimeTrackAction,
  loadMyOlderTracks,
  loadMyTimeTracksAction,
} from "../../reducers/timeTrack/timeTrack.reducer";
import {
  formatSecondsToString,
  getDayMonthShort,
  getFirstDayOfWeek,
  getSecondsDiff,
} from "../../service/date/date.service";

import TimeTrackListItem from "./TimeTrackListItem";
import Starter from "./Starter";
import Loader from "./../common/Loader";

export default function TimeTrackScreen() {
  const dispatch = useDispatch();
  const { projects } = useSelector((state) => state.projectReducer);
  const { tracks, activeTrack, loaded } = useSelector(
    (state) => state.timeTrackReducer
  );
  const [groupedTracks, setGroupedTracks] = useState(null);
  const firstDayOfWeekRef = useRef(getFirstDayOfWeek(new Date()));

  useEffect(() => {
    const today = new Date();
    firstDayOfWeekRef.current = getFirstDayOfWeek(new Date());
    firstDayOfWeekRef.current.setHours(0, 0, 0);
    dispatch(loadProjectsAction());
    dispatch(loadMyTimeTracksAction(firstDayOfWeekRef.current, today));
  }, []);

  useEffect(() => {
    prepareData(tracks);
  }, [tracks]);

  const handleUpdateTrack = (track) => {
    dispatch(editTimeTrackAction(track));
  };

  const handleDeleteTrack = (id) => {
    dispatch(deleteTimeTrackAction(id));
  };

  //todo handle copy track

  const handleLoadOlder = () => {
    const date1 = new Date(firstDayOfWeekRef.current);
    const date2 = new Date(firstDayOfWeekRef.current);
    const timestamp = date1.setTime(date1.getTime() - 7 * 24 * 60 * 60 * 1000);
    const timestampTo = date2.setTime(
      date2.getTime() - 1 * 24 * 60 * 60 * 1000
    );
    firstDayOfWeekRef.current = new Date(timestamp);

    dispatch(
      loadMyOlderTracks(firstDayOfWeekRef.current, new Date(timestampTo))
    );
  };
  //todo group only new tracks???
  const prepareData = (tracks) => {
    const tracksArr = tracks.reduce((tracks, track) => {
      const date = track.beginAt.split("T")[0];
      if (!tracks[date]) {
        tracks[date] = [];
      }
      tracks[date].push(track);
      return tracks;
    }, {});

    const groupTracks = Object.keys(tracksArr).map((date) => {
      let total = 0;
      tracksArr[date].forEach((track) => {
        total += getSecondsDiff(track.beginAt, track.endAt);
      });

      return {
        date: getDayMonthShort(new Date(date)),
        data: tracksArr[date],
        total,
      };
    });

    setGroupedTracks(groupTracks);
  };

  return (
    <div className="row">
      <div className="col-md-12 grid-margin stretch-card">
        <div className="card">
          <div className="card-body">
            <Starter activeTrack={activeTrack} projects={projects} />
          </div>
        </div>
      </div>

      <div className="page-header col-md-12">
        <h5>
          <Trans>track.recordsOfThisWeek</Trans>
        </h5>
      </div>

      {loaded && groupedTracks ? (
        Object.entries(groupedTracks).map(([key, day]) => (
          <div className="col-md-12 grid-margin stretch-card" key={key}>
            <div className="card">
              <div className="card-body">
                <h5 className="track-list-title">
                  {day.date}
                  <small>{formatSecondsToString(day.total, false)}</small>
                </h5>

                <div className="track-list">
                  {day.data.map((track) => (
                    <TimeTrackListItem
                      track={track}
                      key={track.id}
                      projects={projects}
                      deleteTrack={handleDeleteTrack}
                      editTrack={handleUpdateTrack}
                      // onClickCopy={handleCopyTrack}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <Loader />
      )}
      <div className="col-md-12 text-center">
        <button className="btn btn-link" onClick={handleLoadOlder}>
          <Trans>track.loadOlder</Trans>
        </button>
      </div>
    </div>
  );
}
