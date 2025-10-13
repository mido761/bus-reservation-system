import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { User, Phone, Mail, ArrowLeft, Info } from "lucide-react";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const statusStyles = {
  confirmed: "bg-green-100 text-green-800",
  waiting: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800",
  failed: "bg-red-100 text-red-800",
  expired: "bg-gray-100 text-gray-700",
  pending: "bg-blue-100 text-blue-800",
};

function isCurrentPassenger(passenger, currentUserId, bookingId) {
  const passengerId = String(passenger.passenger_id || passenger.user_id || "");
  const currentId = String(currentUserId || "");
  const bookingIdStr = String(bookingId || "");
  return passengerId === currentId || String(passenger.booking_id || "") === bookingIdStr;
}

function formatRoute(passenger) {
  const source = passenger.source || passenger.route_source || "";
  const destination = passenger.destination || passenger.route_destination || "";
  return destination ? `${source} → ${destination}` : source;
}

function HeaderBar({ onBack }) {
  return (
    <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <CardTitle className="text-2xl font-semibold text-gray-800">Passengers List</CardTitle>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
    </CardHeader>
  );
}

function PositionBanner({ positions }) {
  if (!positions || positions.length === 0) return null;
  const label = positions.length > 1 ? "numbers" : "number";
  const list = positions.join(", ");
  return (
    <div className="mb-3 rounded-md border border-blue-200 bg-blue-50 text-blue-900 text-sm mt-4 px-3 py-2 flex items-center gap-2">
      <Info className="w-4 h-4" />
      <span>
        You are {label} <span className="font-semibold">{list}</span> in the list
      </span>
    </div>
  );
}

function DesktopTable({ passengers, currentUserId, bookingId }) {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {["#", "Passenger", "Contact", "Stop", "Route"].map((heading) => (
              <th
                key={heading}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {passengers.map((passenger, index) => {
            const current = isCurrentPassenger(passenger, currentUserId, bookingId);
            return (
              <tr
                key={passenger.booking_id || index}
                className={`hover:bg-gray-50 transition-colors ${current ? "bg-white" : "bg-gray-50"}`}
              >
                <td className="px-6 py-4 text-sm text-gray-700">{index + 1}</td>
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {current ? passenger.name || passenger.username || passenger.user_name : "Hidden"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {current ? (
                    <>
                      <div className="flex items-center gap-2 mb-1 text-gray-700">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {passenger.phone_number || passenger.user_number || "-"}
                      </div>
                      {passenger.email && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {passenger.email}
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-400">Hidden</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{current ? passenger.stop_name || "-" : "-"}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{current ? formatRoute(passenger) || "-" : "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function MobileCards({ passengers, currentUserId, bookingId }) {
  return (
    <div className="grid md:hidden gap-4 mt-4">
      {passengers.map((passenger, index) => {
        const current = isCurrentPassenger(passenger, currentUserId, bookingId);
        return (
          <div
            key={passenger.booking_id || index}
            className={`p-4 rounded-xl border ${current ? "border-blue-300 bg-white" : "border-gray-200 bg-gray-50"} shadow-sm`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {current ? passenger.name || passenger.username || passenger.user_name : "Hidden"}
                </p>
                <p className="text-xs text-gray-400">#{index + 1}</p>
              </div>
            </div>

            <div className="text-sm text-gray-700 space-y-1">
              <p
                className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[passenger.booking_status] ||
                  "bg-gray-100 text-gray-700"
                  }`}
              >
                {passenger.booking_status.toUpperCase()}
              </p>
              <p>
                <span className="font-medium">Stop:</span>{" "}
                {current ? passenger.stop_name || "-" : "-"}
              </p>


              <p>
                <span className="font-medium">Route:</span>{" "}
                {current ? formatRoute(passenger) || "-" : "-"}
              </p>
              <div className="mt-2">
                {current ? (
                  <>
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {passenger.phone_number || passenger.user_number || "-"}
                    </p>
                    {passenger.email && (
                      <p className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {passenger.email}
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
  );
}

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
        const authRes = await axios.get(`${backEndUrl}/auth`, { withCredentials: true });
        if (authRes?.data?.userId) setCurrentUserId(String(authRes.data.userId));
        const res = await axios.get(`${backEndUrl}/booking/get-trip-passengers/${tripId}`, { withCredentials: true });
        setPassengers(res.data.passengers || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load passengers");
      } finally {
        setLoading(false);
      }
    };

    fetchPassengers();
  }, [tripId]);

  const currentUserPositions = useMemo(() => {
    if (loading || error || passengers.length === 0) return [];
    const indices = passengers
      .map((p, i) => (isCurrentPassenger(p, currentUserId, bookingId) ? i + 1 : null))
      .filter((v) => v !== null);
    return indices;
  }, [loading, error, passengers, currentUserId, bookingId]);

  const content = useMemo(() => {
    if (loading) return <div className="text-gray-500 text-center py-8">Loading passengers...</div>;
    if (error) return <div className="text-red-500 text-center py-8">{error}</div>;
    if (passengers.length === 0) return <div className="text-gray-400 text-center py-8">No passengers for this trip.</div>;
    return (
      <>
        <DesktopTable passengers={passengers} currentUserId={currentUserId} bookingId={bookingId} />
        <MobileCards passengers={passengers} currentUserId={currentUserId} bookingId={bookingId} />
      </>
    );
  }, [loading, error, passengers, currentUserId, bookingId]);

  return (
    <div className="min-h-screen mt-2 px-4 sm:px-6 max-w-6xl mx-auto">
      <PositionBanner positions={currentUserPositions} />
      <Card className="shadow-md rounded-2xl">
        <HeaderBar onBack={() => navigate(-1)} />
        <CardContent>{content}</CardContent>
      </Card>
    </div>
  );
};

export default Passengers;
