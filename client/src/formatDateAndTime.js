 const formatDateTime = (time, type) => {
    const today = new Date().toISOString().split("T")[0]; // e.g. "2025-08-21"
    const fullDateTime = `${today}T${time}`; // "2025-08-21T17:00:00"

    const DateTime = new Date(time).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const DateOnly = new Date(time).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const TimeOnly = new Date(fullDateTime).toLocaleString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return type === "dateTime"
      ? DateTime
      : type === "date"
      ? DateOnly
      : TimeOnly;
  };


  export default formatDateTime;