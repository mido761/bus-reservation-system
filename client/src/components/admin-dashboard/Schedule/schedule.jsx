import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import LoadingScreen from "../../loadingScreen/loadingScreen";
import Overlay from "../../overlayScreen/overlay";
import TripForm from "../../../UI/trips/tripForm";
import TripList from "../../../UI/trips/TripList";
import { handleDel } from "../../../handlers/handleDel";
import { handleEdit } from "../../../handlers/handleEdit";
const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const AddTrip = () => {
  // State
  const [trips, setTrips] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ flag: false, message: "" });

  const [formData, setFormData] = useState({
    routeId: "",
    date: "",
    departureTime: "",
    arrivalTime: "",
  });

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fetchTrips = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${backEndUrl}/trip/get-trips`);
      setTrips(data);
    } catch (err) {
      setAlert({ flag: true, message: err?.response?.data?.message || "Error fetching trips" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${backEndUrl}/route/get-routes`);
      setRoutes(data);
    } catch (err) {
      setAlert({ flag: true, message: err?.response?.data?.message || "Error fetching routes" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post(`${backEndUrl}/trip/add-trip`, formData);
      setTrips((prev) => [...prev, formData]);
      setAlert({ flag: true, message: "Trip added successfully!" });
      fetchTrips();
      // Reset form
      setFormData({
        routeId: "",
        date: "",
        departureTime: "",
        arrivalTime: "",
      });
    } catch (err) {
      setAlert({ flag: true, message: err?.response?.data?.message || "Error adding trip" });
    } finally {
      setIsLoading(false);
      setTimeout(() => setAlert({ flag: false, message: "" }), 2200);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchRoutes();
    fetchTrips();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Add Trip Form */}
      <Card className="shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold flex items-center gap-2">
            📍 Add New Trip
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

      {/* Trips List */}
      <Card className="shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold flex items-center gap-2">
            🚌 Trips List
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <TripList
            trips={trips}
            routes={routes}
            handleDel={handleDel}
            handleEdit={handleEdit}
            setTrips={setTrips}
            setIsLoading={setIsLoading}
            setAlertMessage={(msg) => setAlert({ flag: true, message: msg })}
            setAlertFlag={(flag) => setAlert((prev) => ({ ...prev, flag }))}
          />
        </CardContent>
      </Card>

      {/* Loading & Alerts */}
      {isLoading && <LoadingScreen />}
      <Overlay
        alertFlag={alert.flag}
        alertMessage={alert.message}
        setAlertFlag={(flag) => setAlert((prev) => ({ ...prev, flag }))}
      />
    </div>
  );
};

export default AddTrip;
