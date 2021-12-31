export const getMonthDayTime = (date) => {
  if (typeof date === "string") {
    date = new Date(date);
  }

  return new Intl.DateTimeFormat("cs-CZ", {
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "numeric",
  }).format(date);
};

export const getStringDiffAgo = (date) => {
  if (typeof date === "string") {
    date = new Date(date);
  }
  const now = new Date();
  const diffMs = now - date; // milliseconds between now & date
  const diffDays = Math.floor(diffMs / 86400000); // days
  const diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
  const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);

  if (diffDays > 30) return "před více než měsícem";
  if (diffDays > 1) return `před ${diffDays} dny`;
  if (diffDays === 1) return "včera";
  if (diffDays <= 0) {
    if (diffHrs > 0) {
      if (diffHrs === 1) return `před hodinout`;
      else return `před ${diffHrs} hod`;
    } else {
      if (diffMins <= 0) return `nyní`;
      else if (diffMins === 1) return "před minutou";
      else return `před ${diffMins} min`;
    }
  }
};

export const getDeltaTime = (date) => {
  if (!date) return "00:00:00";
  if (typeof date === "string") {
    date = new Date(date);
  }
  const now = new Date();
  const deltaSecs = (now - date) / 1000;

  const h = Math.floor(deltaSecs / 60 / 60)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((deltaSecs / 60) % 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(deltaSecs % 60)
    .toString()
    .padStart(2, "0");

  return `${h}:${m}:${s}`;
};

export const getHMS = (date) => {
  if (!date) return "00:00:00";
  if (typeof date === "string") {
    date = new Date(date);
  }

  return new Intl.DateTimeFormat("cs-CZ", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).format(date);
};

export const getHM = (date) => {
  if (!date) return "00:00";
  if (typeof date === "string") {
    date = new Date(date);
  }

  return new Intl.DateTimeFormat("cs-CZ", {
    hour: "numeric",
    minute: "numeric",
  }).format(date);
};

export const getDayMonthShort = (date) => {
  if (!date) return "";
  if (typeof date === "string") {
    date = new Date(date);
  }

  return new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "numeric",
  }).format(date);
};

/**
 *
 * @param {(Date|string)} begin
 * @param {(Date|string)} end
 * @returns {(number|null)}
 */
export const getSecondsDiff = (begin, end) => {
  if (!begin || !end) return null;
  if (typeof begin === "string") begin = new Date(begin);
  if (typeof end === "string") end = new Date(end);

  return (end - begin) / 1000;
};

/**
 *
 * @param {Number} seconds
 * @param {boolean} showSeconds
 * @returns {string}
 */
export const formatSecondsToString = (seconds, showSeconds = true) => {
  const h = Math.floor(seconds / 60 / 60)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((seconds / 60) % 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");

  if (!showSeconds) {
    if (h == 0 && m == 0 && s > 0) return "00:01";
    return `${h}:${m}`;
  }

  if (h > 0) return `${h}:${m}:${s}`;
  return `${m}:${s}`;
};

/**
 *
 * @param {Date|string} date
 * @returns {Date}
 */
export const getFirstDayOfWeek = (date) => {
  if (typeof date === "string") date = new Date(date);
  const day = date.getDay(),
    diff = date.getDate() - day + (day == 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

/**
 *
 * @param {Date} date
 * @returns {boolean}
 */
export const isDateToday = (date) => {
  const today = new Date();
  if (typeof date === "string") date = new Date(date);
  return (
    date.getDate() == today.getDate() &&
    date.getMonth() == today.getMonth() &&
    date.getFullYear() == today.getFullYear()
  );
};
