import React from "react";
import { User, Phone } from "lucide-react";

const DriverPassengerList = ({
  passengers = [],
  loading = false,
  isAdmin = false,
  currentUserId = null,
}) => {
  if (loading)
    return (
      <div className="p-3 text-gray-500 animate-pulse">Loading passengers...</div>
    );

  if (!passengers || passengers.length === 0)
    return (
      <div className="p-3 text-gray-400 italic text-sm">
        No passengers for this trip
      </div>
    );

  return (
    <div className="divide-y divide-gray-100">
      {passengers.map((p) => (
        <div
          key={p.booking_id}
          className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-md transition"
        >
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 text-indigo-600 p-2 rounded-full">
              <User size={16} />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-800">
                {p.name || p.username || "Unknown"}
              </div>
              <div className="text-xs text-gray-500">
                {p.stop_name || "-"} • {p.source || p.route_source || ""} →{" "}
                {p.destination || p.route_destination || ""}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1 text-gray-500 text-xs justify-end">
              <Phone size={12} /> Phone
            </div>
            <div className="text-sm font-medium text-gray-800">
              {isAdmin || String(p.passenger_id) === String(currentUserId)
                ? p.phone_number || "-"
                : <span className="text-gray-400 text-xs">Hidden</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DriverPassengerList;
