import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { format } from "date-fns";
import formatDateAndTime from "../../../formatDateAndTime";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const MyTrips = () => {
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState([]);

  const getUserTrips = async () => {
    try {
      const reqUser = await axios.get(`${backEndUrl}/auth`, { withCredentials: true });
      const userId = reqUser.data.userId;

      const userBookings = await axios.get(`${backEndUrl}/trip/get-user-trips`, {
        withCredentials: true,
      });

      setTrips(userBookings.data);
    } catch (err) {
      console.error("Error fetching user trips:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserTrips();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Loading your trips...
      </div>
    );
  }

  if (!Array.isArray(trips) || trips.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-400">
        You have no trip history yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">My Trips</h2>

      <div className="grid gap-6 md:grid-cols-2">
        {trips.map((trip, idx) => (
          <Card key={trip.trip_id || idx} className="shadow-md hover:shadow-lg transition">
            <CardHeader>
              <CardTitle className="flex justify-between items-center text-lg">
                <span>{trip.source} → {trip.destination}</span>
                <span className="text-sm text-gray-500">
                  {formatDateAndTime(trip.date, "date")}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Departure: {formatDateAndTime(trip.departure_time)}</span>
                <span>Arrival: {formatDateAndTime(trip.arrival_time)}</span>
              </div>
              <div className="text-sm">
                <strong>Status: </strong>
                <span
                  className={`font-medium ${
                    trip.status === "confirmed" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {trip.status}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyTrips;
