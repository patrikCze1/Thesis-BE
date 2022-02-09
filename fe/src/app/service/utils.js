/**
 *
 * @param {Object} obj
 * @returns {boolean}
 */
export const objectIsNotEmpty = (obj) => {
  if (!obj) return false;
  return Object.keys(obj).length > 0;
};
