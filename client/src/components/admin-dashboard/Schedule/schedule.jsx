import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import TripForm from "../../../UI/trips/TripForm";
import TripEditDialog from "../../../UI/trips/TripEdit";
import { Calendar } from "lucide-react";
import PassengerList from "../../admin-dashboard/passengerslist/PassengerList";
import LoadingScreen from "../../loadingScreen/loadingScreen";
import formatDateTime from "../../../formatDateAndTime";
import ButtonActions from "../ButtonActions";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const statusStyles = {
  confirmed: "bg-green-100 text-green-800",
  waiting: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800",
  failed: "bg-red-100 text-red-800",
  expired: "bg-gray-100 text-gray-700",
  pending: "bg-blue-100 text-blue-800",
};


const AddTrip = () => {
  const [trips, setTrips] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [formData, setFormData] = useState({
    routeId: "",
    date: "",
    departureTime: "",
    arrivalTime: "",
    price: "",
    min_cap: ""
  });
  // Passengers page logic
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [tripStats, setTripStats] = useState({
    totalPassengers: 0,
    stopCounts: {},
  });
  const [error, setError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);

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

  // Derive unique statuses from trips for filter dropdown
  const tripStatusOptions = useMemo(() => {
    const unique = Array.from(new Set((trips || []).map((t) => t.status).filter(Boolean)));
    return ["", ...unique];
  }, [trips]);

  // Apply status filter to trips list
  const visibleTrips = useMemo(() => {
    if (!statusFilter) return trips;
    return (trips || []).filter((t) => (t.status || "").toLowerCase() === statusFilter.toLowerCase());
  }, [trips, statusFilter]);

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

  const openEditDialog = (e, trip) => {
    e.stopPropagation();
    setEditingTrip(trip);
    setEditOpen(true);
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
      // setTrips((prev) => [...prev, formData]);
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
        min_cap: ""
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
      <Card className="border border-gray-200">
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Trip List */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Calendar className="w-6 h-6 text-blue-600" /> Select Trip
                </CardTitle>
                <div className="flex items-center gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 w-full sm:w-48"
                  >
                    <option value="">All Status</option>
                    {tripStatusOptions
                      .filter((v) => v !== "")
                      .map((status) => (
                        <option key={status} value={status}>
                          {String(status).charAt(0).toUpperCase() + String(status).slice(1)}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleTrips.map((trip) => (
                  <Card
                    key={trip.trip_id}
                    onClick={() => handleTripSelect(trip)}
                    className={`cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg ${selectedTrip?.trip_id === trip.trip_id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <CardContent className="space-y-3 p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">
                          {trip.source} → {trip.destination}
                        </h3>
                        <p
                          className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[trip.status] ||
                            "bg-gray-100 text-gray-700"
                            }`}
                        >
                          {trip.status.toUpperCase()}
                        </p>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span>{formatDateTime(trip.date, "date")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>
                            {formatDateTime(trip.departure_time)} - {formatDateTime(trip.arrival_time)}
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
                        <ButtonActions
                          onEdit={(e) => openEditDialog(e, trip)}
                          onDelete={(e) => { e.stopPropagation(); console.log("Delete Trip", trip); }}
                          editLabel={"Edit"}
                          deleteLabel={"Delete"}
                          showCompleteCancel
                          onComplete={(e) => { e.stopPropagation(); console.log("Complete Trip", trip); }}
                          onCancel={(e) => { e.stopPropagation(); console.log("Cancel Trip", trip); }}
                          completeLabel={"Complete"}
                          cancelLabel={"Cancel"}
                          completeDisabled={String(trip.status).toLowerCase() !== 'waiting'}
                          cancelDisabled={String(trip.status).toLowerCase() === 'booked'}
                        />
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

      {/* Edit Trip Dialog */}
      <TripEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        trip={editingTrip}
        onUpdated={fetchTrips}
      />
    </>
  );
};

export default AddTrip;
