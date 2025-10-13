export const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  
  export const formatTime = (time) =>
    new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  
  export const getStatusColor = (status, type) => {
    const s = status?.toLowerCase();
    if (type === "payment") {
      if (s === "successful" || s === "sucsseful") return "bg-green-100 text-green-800";
      if (s === "pending") return "bg-yellow-100 text-yellow-800";
      if (s === "failed") return "bg-red-100 text-red-800";
    } else if (type === "booking") {
      if (s === "confirmed") return "bg-green-100 text-green-800";
      if (s === "waiting") return "bg-yellow-100 text-yellow-800";
      if (s === "cancelled") return "bg-red-100 text-red-800";
      if (s === "completed") return "bg-blue-100 text-blue-800";
    }
    return "bg-gray-100 text-gray-800";
  };
  