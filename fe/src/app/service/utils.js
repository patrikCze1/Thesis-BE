/**
 *
 * @param {Object} obj
 * @returns {boolean}
 */
export const objectIsNotEmpty = (obj) => {
  if (!obj) return false;
  return Object.keys(obj).length > 0;
};

export const validateCurrencyPattern = (string) => {
  const patt = /^(\d*)([,.]\d{0,2})?$/;
  const matchedString = string.match(patt);
  console.log("matchedString", matchedString);
  console.log("patt", patt);
  if (matchedString) {
    return (
      matchedString[1] +
      (matchedString[2] ? matchedString[2].replace(",", ".") : "")
    );
  } else {
    return string.slice(0, -1);
  }
};
