import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import TripForm from "../../../UI/trips/TripForm";
import { Calendar } from "lucide-react";
import PassengerList from "../../admin-dashboard/passengerslist/PassengerList";
import LoadingScreen from "../../loadingScreen/loadingScreen";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const AddTrip = () => {
  const [trips, setTrips] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    routeId: "",
    date: "",
    departureTime: "",
    arrivalTime: "",
  });
  // Passengers page logic
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [tripStats, setTripStats] = useState({
    totalPassengers: 0,
    stopCounts: {},
  });
  const [error, setError] = useState("");

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Fetch trips (for passengers list)
  const fetchTrips = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${backEndUrl}/trip/get-trips-with-counts`);
      if (!res.ok) throw new Error("Failed to fetch trips");
      setTrips(await res.json());
    } catch (err) {
      setError("Failed to load trips");
      toast.error("Failed to load trips");
    } finally {
      setIsLoading(false);
    }
  };
  // Fetch passengers for a trip
  const fetchPassengers = async (tripId) => {
    try {
      setIsLoading(true);
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
      toast.error("Failed to load passengers");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle trip selection
  const handleTripSelect = (trip) => {
    if (trip === selectedTrip) {
      setSelectedTrip(false);
      return;
    }
    setSelectedTrip(trip);
    fetchPassengers(trip.trip_id);
  };

  // Fetch all buses
  const fetchBuses = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${backEndUrl}/bus/get-available-buses`);
      setBuses(data.buses || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error fetching buses!");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch routes
  const fetchRoutes = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${backEndUrl}/route/get-routes`);
      setRoutes(data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error fetching routes", {
        position: "top-center",
        autoClose: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new trip
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post(`${backEndUrl}/trip/add-trip`, formData);
      setTrips((prev) => [...prev, formData]);
      toast.success("Trip added successfully!", {
        position: "top-center",
        autoClose: 2000,
      });
      // Reset form
      setFormData({
        routeId: "",
        date: "",
        departureTime: "",
        arrivalTime: "",
      });
      fetchTrips();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error adding trip", {
        position: "top-center",
        autoClose: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new trip
  const handleLink = async (e, tripId, busId) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post(`${backEndUrl}/trip/link-trip-bus`, { tripId, busId });

      toast.success("Trip added successfully!", {
        position: "top-center",
        autoClose: 2000,
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error adding trip", {
        position: "top-center",
        autoClose: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
    fetchTrips();
    fetchBuses();
  }, []);

  return (
    <>
      {/* Add Trip Form */}
      <Card className=" border border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold flex items-center gap-2">
            ➕ Add New Trip
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TripForm
            formData={formData}
            routes={routes}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
          />
        </CardContent>
      </Card>

      {/* Passengers List Page (replaces TripList) */}
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Trip List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Calendar className="w-6 h-6 text-blue-600" /> Select Trip
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trips.map((trip) => (
                  <Card
                    key={trip.trip_id}
                    onClick={() => handleTripSelect(trip)}
                    className={`cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg ${
                      selectedTrip?.trip_id === trip.trip_id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <CardContent className="space-y-3 p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">
                          {trip.source} → {trip.destination}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full font-medium ${
                            trip.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {trip.status}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span>{trip.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>
                            {trip.departure_time} - {trip.arrival_time}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div>
                          <p className="text-lg font-bold text-blue-600">{trip.price} EGP</p>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span>{trip.total_passengers || 0} passengers</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Passengers */}
          {selectedTrip && (
            <PassengerList
              selectedTrip={selectedTrip}
              passengers={passengers}
              tripStats={tripStats}
              loading={isLoading}
            />
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && <LoadingScreen />}

      {/* Toast Container */}
      <ToastContainer />
    </>
  );
};

export default AddTrip;
