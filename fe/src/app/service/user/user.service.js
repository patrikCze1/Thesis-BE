import CryptoJS from "crypto-js";

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
export const parseUserFromStorage = () => {
  const itemStr = window.localStorage.getItem("app-user");

  if (!itemStr) return null;

  const item = JSON.parse(itemStr);
  const now = new Date();

  if (!item.expiry || now.getTime() > item.expiry) {
    window.localStorage.removeItem("app-user");
    return null;
  }

  return JSON.parse(decrypt(item.value));
};

function decrypt(str) {
  return CryptoJS.AES.decrypt(str, "Secret Passphrase").toString(
    CryptoJS.enc.Utf8
  );
}
