import jwtDecode from "jwt-decode";

export const getFullName = (user) => {
  if (!user) return "";
  return `${user.lastName} ${user.firstName}`;
};

/**
 *
 * @param {object} user
 * @returns {string}
 */
export const getShortName = (user) => {
  if (!user) return "";
  return `${user?.lastName?.charAt(0).toUpperCase()}${user?.firstName
    ?.charAt(0)
    .toUpperCase()}`;
};

/**
 *
 * @returns {object|null} user
 */
export const parseUserFromJwt = () => {
  const itemStr = window.localStorage.getItem("app-user");

  if (!itemStr) return null;

  const item = JSON.parse(itemStr);
  const token = jwtDecode(item.value);
  const now = new Date();
  console.log("token", token);
  if (!item.expiry || now.getTime() > item.expiry) {
    window.localStorage.removeItem("app-user");
    return null;
  }

  return {
    user: token.user,
  };
};
