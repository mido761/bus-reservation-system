import { DateTime } from "luxon";

const formatDateTime = (time = "00:00:00", type = "time", timeZone = "EET") => {
  let luxonDateTime;

  // Case 1: full datetime string (e.g. "2025-09-03T15:30:00")
  if (time.includes("T")) {
    luxonDateTime = DateTime.fromISO(time, { zone: timeZone });
  } 
  // Case 2: date only (e.g. "2025-09-03")
  else if (time.match(/^\d{4}-\d{2}-\d{2}$/)) {
    luxonDateTime = DateTime.fromISO(`${time}T00:00:00`, { zone: timeZone });
  } 
  // Case 3: time only (e.g. "15:30:00")
  else if (time.includes(":")) {
    const today = DateTime.now().toISODate();
    luxonDateTime = DateTime.fromISO(`${today}T${time}`, { zone: timeZone });
  } 
  // Default fallback
  else {
    luxonDateTime = DateTime.fromISO(time, { zone: timeZone });
  }

  if (!luxonDateTime.isValid) {
    return null;
  }

  const formats = {
    dateTime: luxonDateTime.toLocaleString(DateTime.DATETIME_MED),
    date: luxonDateTime.toLocaleString(DateTime.DATE_MED),
    time: luxonDateTime.toLocaleString(DateTime.TIME_SIMPLE),
  };

  return formats[type] || null;
};

export default formatDateTime;
