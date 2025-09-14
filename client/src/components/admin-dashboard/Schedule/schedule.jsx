import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import TripForm from "../../../UI/trips/TripForm";
import TripList from "../../../UI/trips/TripList";
import { handleDel } from "../../../handlers/handleDel";
import { handleEdit } from "../../../handlers/handleEdit";
import LoadingScreen from "../../loadingScreen/loadingScreen";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const AddTrip = () => {
  const [trips, setTrips] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    routeId: "",
    date: "",
    departureTime: "",
    arrivalTime: "",
  });

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Fetch trips
  const fetchTrips = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${backEndUrl}/trip/get-trips`);
      setTrips(data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error fetching trips", {
        position: "top-center",
        autoClose: 2000,
      });
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

  useEffect(() => {
    fetchRoutes();
    fetchTrips();
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

      {/* Trips List */}
      <Card className="shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
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
            showToast={(msg, type = "success") =>
              type === "success"
                ? toast.success(msg, {
                    position: "top-center",
                    autoClose: 2000,
                  })
                : toast.error(msg, { position: "top-center", autoClose: 2000 })
            }
          />
        </CardContent>
      </Card>

      {/* Loading Overlay */}
      {isLoading && <LoadingScreen />}

      {/* Toast Container */}
      <ToastContainer />
    </>
  );
};

export default AddTrip;
