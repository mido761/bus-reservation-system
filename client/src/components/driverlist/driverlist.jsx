import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Navbar from "../navbar/nav";
import TripList from "../admin-dashboard/passengerslist/TripList";
import PassengerList from "../admin-dashboard/passengerslist/PassengerList";
import { Calendar } from "lucide-react";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const groupByDate = (trips = []) => {
  const map = new Map();
  trips.forEach((t) => {
    const date = t.date || t.date_string || "Unknown";
    const key = date.split("T")[0] || date;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(t);
  });
  return Array.from(map.entries())
    .map(([date, items]) => ({ date, items }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

const DriverList = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);

  const [passengers, setPassengers] = useState([]);
  const [tripStats, setTripStats] = useState({ totalPassengers: 0, stopCounts: {} });
  const [passengersLoading, setPassengersLoading] = useState(false);
  const POLL_INTERVAL_MS = 10000; // refresh passengers every 10 seconds in driver view

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${backEndUrl}/booking/get-trips-with-counts`, { withCredentials: true });
        setTrips(res.data || []);
        // auto-select first date if available
        const grouped = groupByDate(res.data || []);
        if (grouped.length) setSelectedDate(grouped[0].date);
      } catch (err) {
        console.error(err);
        setError(err?.response?.data?.message || "Failed to load trips");
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const grouped = useMemo(() => groupByDate(trips), [trips]);

  const handleDateSelect = (date) => {
    setSelectedTrip(null);
    setPassengers([]);
    setTripStats({ totalPassengers: 0, stopCounts: {} });
    setSelectedDate(date);
  };

  // Fetch passengers helper (used on demand and by poller)
  const fetchPassengers = async (tripId) => {
    if (!tripId) return;
    setPassengersLoading(true);
    try {
      const res = await axios.get(`${backEndUrl}/booking/get-trip-passengers/${tripId}`, { withCredentials: true });
      setPassengers(res.data.passengers || []);
      setTripStats({ totalPassengers: res.data.totalPassengers || (res.data.passengers || []).length, stopCounts: res.data.stopCounts || {} });
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to load passengers");
    } finally {
      setPassengersLoading(false);
    }
  };

  const handleTripSelect = (trip) => {
    setSelectedTrip(trip);
    // fetch immediately; polling effect will take care of subsequent updates
    fetchPassengers(trip?.trip_id);
  };

  const tripsForSelectedDate = grouped.find((g) => g.date === selectedDate)?.items || [];

  // Poll passengers for the selected trip so driver view reflects cancellations quickly
  useEffect(() => {
    if (!selectedTrip) return undefined;
    const tripId = selectedTrip.trip_id;
    // initial fetch already performed in handleTripSelect, but ensure data current
    fetchPassengers(tripId);
    const id = setInterval(() => fetchPassengers(tripId), POLL_INTERVAL_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTrip]);

  return (
    <>
      <Navbar />
      <div className="mt-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dates column */}
          <div className="col-span-1">
            <div className="bg-white border rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold">Dates</h3>
              </div>
              <div className="space-y-3">
                {loading ? (
                  <div className="text-gray-500">Loading dates...</div>
                ) : grouped.length === 0 ? (
                  <div className="text-gray-400">No scheduled trips</div>
                ) : (
                  grouped.map(({ date, items }) => (
                    <button
                      key={date}
                      onClick={() => handleDateSelect(date)}
                      className={`w-full text-left p-3 rounded-md border ${selectedDate === date ? "bg-indigo-50 border-indigo-200" : "bg-white border-gray-100"}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-600">{new Date(date).toDateString()}</div>
                          <div className="text-base font-medium text-gray-800">{items.length} trip{items.length>1?"s":""}</div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Trips & passengers column */}
          <div className="col-span-2 space-y-6">
            <TripList
              trips={tripsForSelectedDate}
              selectedTrip={selectedTrip}
              onTripSelect={handleTripSelect}
              error={error}
            />

            {selectedTrip && (
              <PassengerList
                selectedTrip={selectedTrip}
                passengers={passengers}
                tripStats={tripStats}
                loading={passengersLoading}
                driverMode={true}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DriverList;
