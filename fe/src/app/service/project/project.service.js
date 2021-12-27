import i18n from "../../../i18n";
import { getSecondsDiff } from "../date/date.service";

/**
 *
 * @param {array} tracks
 * @param {array} projects
 * @returns {array}
 */
export const getTrackDatesByProjectForChart = (tracks, projects) => {
  const projectNames = getProjectNamesById([
    ...projects,
    { id: -1, name: i18n.t("track.withoutProject") },
  ]);
  const tracksObj = tracks.reduce((tracks, track) => {
    if (!tracks[projectNames[track.projectId || -1]]) {
      tracks[projectNames[track.projectId || -1]] = [];
    }
    tracks[projectNames[track.projectId || -1]].push(track);
    return tracks;
  }, {});

  return Object.keys(tracksObj).map((project) => {
    let total = 0;
    tracksObj[project].forEach((track) => {
      total += getSecondsDiff(track.beginAt, track.endAt);
    });
    const hours = total / (60 * 60);

    return [project, hours];
  });
};

/**
 *
 * @param {array} projects
 * @returns {Object}
 */
export const getProjectNamesById = (projects) => {
  const obj = {};
  for (const project of projects) {
    obj[project.id] = project.name;
  }

  return obj;
};
