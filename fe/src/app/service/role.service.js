import { ROLES } from "../../utils/enum";

/**
 *
 * @returns {array}
 */
export const getRoles = () => {
  return Object.values(ROLES);
};

/**
 *
 * @param {string|array} roles
 * @param {array} userRoles
 */
export const hasRole = (roles, userRoles) => {
  if (!userRoles || userRoles.length === 0) return false;
  else if (typeof roles === "string" && userRoles.includes(roles)) return true;
  else if (Array.isArray(roles) && userRoles.some((r) => roles.includes(r)))
    return true;
  return false;
};
