import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import TripList from "./TripList";
import PassengerList from "./PassengerList";
import { formatDate } from "./utils";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const PassengersPage = () => {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [tripStats, setTripStats] = useState({
    totalPassengers: 0,
    stopCounts: {},
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch trips on mount
  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${backEndUrl}/booking/get-trips-with-counts`);
      if (!res.ok) throw new Error("Failed to fetch trips");
      setTrips(await res.json());
    } catch (err) {
      setError("Failed to load trips");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPassengers = async (tripId) => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(
        `${backEndUrl}/booking/get-trip-passengers/${tripId}`
      );
      if (!res.ok) throw new Error("Failed to fetch passengers");
      const data = await res.json();
      setPassengers(data.passengers || []);
      setTripStats({
        totalPassengers: data.totalPassengers || 0,
        stopCounts: data.stopCounts || {},
      });
    } catch (err) {
      setError("Failed to load passengers");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTripSelect = (trip) => {
    if (trip === selectedTrip) {
      setSelectedTrip(false);
      return;
    }
    setSelectedTrip(trip);
    fetchPassengers(trip.trip_id);
  };

  if (loading && trips.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Trip List */}
        <TripList
          trips={trips}
          selectedTrip={selectedTrip}
          onTripSelect={handleTripSelect}
          error={error}
        />

        {/* Passengers */}
        {selectedTrip && (
          <PassengerList
            selectedTrip={selectedTrip}
            passengers={passengers}
            tripStats={tripStats}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default PassengersPage;
