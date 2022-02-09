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
