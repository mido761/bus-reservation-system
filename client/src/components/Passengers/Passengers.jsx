import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { User, Phone, Mail, ArrowLeft } from "lucide-react";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const Passengers = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [tripId] = useState(state?.tripId || "");
  const [bookingId] = useState(state?.bookingId || "");
  const [passengers, setPassengers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!tripId) {
      setError("No trip selected");
      setLoading(false);
      return;
    }

    const fetchPassengers = async () => {
      try {
        setLoading(true);
        // Authenticated user
        const authRes = await axios.get(`${backEndUrl}/auth`, { withCredentials: true });
        if (authRes?.data?.userId) setCurrentUserId(String(authRes.data.userId));

        // Fetch passengers
        const res = await axios.get(`${backEndUrl}/booking/get-trip-passengers/${tripId}`, { withCredentials: true });
        setPassengers(res.data.passengers || []);
      } catch (err) {
        console.error("Error fetching passengers:", err);
        setError(err?.response?.data?.message || "Failed to load passengers");
      } finally {
        setLoading(false);
      }
    };

    fetchPassengers();
  }, [tripId]);

  return (
    <div className="mt-20 px-4 sm:px-6 max-w-6xl mx-auto">
      <Card className="shadow-md rounded-2xl">
        {/* Header */}
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="text-2xl font-semibold text-gray-800">Passengers List</CardTitle>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </CardHeader>

        {/* Content */}
        <CardContent>
          {loading ? (
            <div className="text-gray-500 text-center py-8">Loading passengers...</div>
          ) : error ? (
            <div className="text-red-500 text-center py-8">{error}</div>
          ) : passengers.length === 0 ? (
            <div className="text-gray-400 text-center py-8">No passengers for this trip.</div>
          ) : (
            <>
              {/* Desktop View (Table) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {["#", "Passenger", "Contact", "Stop", "Route"].map((h) => (
                        <th
                          key={h}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {passengers.map((p, idx) => {
                      const isCurrent =
                        String(p.passenger_id || p.user_id) === String(currentUserId) ||
                        String(p.booking_id) === String(bookingId);

                      return (
                        <tr
                          key={p.booking_id || idx}
                          className={`hover:bg-gray-50 transition-colors ${
                            isCurrent ? "bg-white" : "bg-gray-50"
                          }`}
                        >
                          <td className="px-6 py-4 text-sm text-gray-700">{idx + 1}</td>
                          <td className="px-6 py-4 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {isCurrent ? p.name || p.username || p.user_name : "Hidden"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {isCurrent ? (
                              <>
                                <div className="flex items-center gap-2 mb-1 text-gray-700">
                                  <Phone className="w-4 h-4 text-gray-400" />
                                  {p.phone_number || p.user_number || "-"}
                                </div>
                                {p.email && (
                                  <div className="flex items-center gap-2 text-gray-700">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    {p.email}
                                  </div>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-400">Hidden</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {isCurrent ? p.stop_name || "-" : "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {isCurrent
                              ? `${p.source || p.route_source || ""}${
                                  p.destination || p.route_destination
                                    ? ` → ${p.destination || p.route_destination}`
                                    : ""
                                }`
                              : "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile View (Cards) */}
              <div className="grid md:hidden gap-4 mt-4">
                {passengers.map((p, idx) => {
                  const isCurrent =
                    String(p.passenger_id || p.user_id) === String(currentUserId) ||
                    String(p.booking_id) === String(bookingId);

                  return (
                    <div
                      key={p.booking_id || idx}
                      className={`p-4 rounded-xl border ${
                        isCurrent ? "border-blue-300 bg-white" : "border-gray-200 bg-gray-50"
                      } shadow-sm`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {isCurrent ? p.name || p.username || p.user_name : "Hidden"}
                          </p>
                          <p className="text-xs text-gray-400">#{idx + 1}</p>
                        </div>
                      </div>

                      <div className="text-sm text-gray-700 space-y-1">
                        <p>
                          <span className="font-medium">Stop:</span>{" "}
                          {isCurrent ? p.stop_name || "-" : "-"}
                        </p>
                        <p>
                          <span className="font-medium">Route:</span>{" "}
                          {isCurrent
                            ? `${p.source || p.route_source || ""}${
                                p.destination || p.route_destination
                                  ? ` → ${p.destination || p.route_destination}`
                                  : ""
                              }`
                            : "-"}
                        </p>
                        <div className="mt-2">
                          {isCurrent ? (
                            <>
                              <p className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                {p.phone_number || p.user_number || "-"}
                              </p>
                              {p.email && (
                                <p className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-gray-400" />
                                  {p.email}
                                </p>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-400">Contact Hidden</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Passengers;
