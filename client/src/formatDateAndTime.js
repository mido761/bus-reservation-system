import { DateTime } from 'luxon';

const formatDateTime = (time, type='time', timeZone = 'UTC') => {
  // Get today's date in ISO format (YYYY-MM-DD)
  const today = DateTime.now().toISODate();

  // Ensure the `time` is in the correct format (e.g., "HH:mm:ss")
  // If time is just a date (e.g., "2025-09-03"), add default time ("00:00:00")
  const validTime = time.includes(":") ? time : "00:00:00"; 
  const fullDateTime = `${today}T${validTime}`;

  // Parse the datetime string with Luxon
  const luxonDateTime = DateTime.fromISO(fullDateTime, { zone: timeZone });

  // Check if the datetime is valid
  if (!luxonDateTime.isValid) {
    console.error("Invalid date-time string:", fullDateTime);
    return null;  // Handle the invalid case (returning null here)
  }

  // Define the formatting options
  const dateTimeFormat = luxonDateTime.toLocaleString(DateTime.DATETIME_MED); // e.g., "21 Aug 2025, 5:00 PM"
  const dateOnlyFormat = luxonDateTime.toLocaleString(DateTime.DATE_MED); // e.g., "21 Aug 2025"
  const timeOnlyFormat = luxonDateTime.toLocaleString(DateTime.TIME_SIMPLE); // e.g., "5:00 PM"

  // Return based on the requested type
  if (type === "dateTime") {
    return dateTimeFormat;
  } else if (type === "date") {
    return dateOnlyFormat;  // Return only the date in the "date" format
  } else if (type === "time") {
    return timeOnlyFormat;  // Return only the time (if requested)
  } else {
    return null;  // Fallback if type is not recognized
  }
};

export default formatDateTime;
