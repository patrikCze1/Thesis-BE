import { ROUTE } from "../../utils/enum";

/**
 *
 * @param {string} route
 * @param {Object} params
 * @returns {string} route
 */
export const createRouteWithParams = (route, params) => {
  for (const key in params) {
    route = route.replace(key, params[key]);
  }
  return route;
};

/**
 *
 * @param {Object} task
 * @returns {string} url
 */
export const createTaskRoute = (task) => {
  if (task.archived)
    return (
      createRouteWithParams(ROUTE.PROJECTS_DETAIL_ARCHIVE, {
        ":id": task.projectId,
      }) + `?ukol=${task.id}`
    );
  else if (!task.stageId)
    return (
      createRouteWithParams(ROUTE.PROJECTS_DETAIL_BACKLOG, {
        ":id": task.projectId,
      }) + `?ukol=${task.id}`
    );
  else
    return (
      createRouteWithParams(ROUTE.PROJECTS_BOARDS_DETAIL, {
        ":id": task.projectId,
        ":boardId": task.boardId,
      }) + `?ukol=${task.id}`
    );
};
