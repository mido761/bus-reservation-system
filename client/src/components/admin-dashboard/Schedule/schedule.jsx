// import "./AddBus.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import LoadingScreen from "../../loadingScreen/loadingScreen";
import Overlay from "../../overlayScreen/overlay";
import TripForm from "../../../UI/trips/tripForm";
import { handleDel } from "../../../handlers/handleDel";
import { handleEdit } from "../../../handlers/handleEdit";
import "../formPage.css";
import TripList from "../../../UI/trips/TripList";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const AddTrip = () => {
  const [trips, setTrips] = useState([]);
  const [availableBuses, setAvailableBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [alertFlag, setAlertFlag] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    // busIds: [], // array of bus IDs
    routeId: "", // array of route IDs
    date: "",
    departureTime: "",
    arrivalTime: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    // Handle multiple select separately
    if (name === "routeId") {
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const fetchTrips = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${backEndUrl}/trip/get-trips`);
      console.log(data);
      setTrips(data);
    } catch (err) {
      console.error(err);
      setAlertMessage(err?.response?.data?.message || "Error fetching Trips!");
      setAlertFlag(true);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchAvailableBuses = async () => {
    try {
      const { data } = await axios.get(`${backEndUrl}/bus/get-available-buses`);

      setAvailableBuses(data);
    } catch (err) {
      console.error(
        "Error fetching available buses!",
        err?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      const routes = await axios.get(`${backEndUrl}/route/get-routes`);

      setRoutes(routes.data);
    } catch (err) {
      console.error(
        "Error fetching available buses!",
        err?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // fetchAvailableBuses();
    fetchRoutes();
    fetchTrips();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post(`${backEndUrl}/trip/add-trip`, formData);

      setTrips((prev) => [...prev, formData]);
      setAlertMessage("Trip Added Successfully");
      setAlertFlag(true);
      fetchTrips();
    } catch (err) {
      console.error(err);
      setAlertMessage(err?.response?.data?.message || "Something went wrong");
      setAlertFlag(true);
    } finally {
      setIsLoading(false);
      setTimeout(() => setAlertFlag(false), 2200);
    }
  };

  return (
    <div className="form-page-container">
      <TripForm
        formData={formData}
        routes={routes}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
      />

      {/* Trips List */}
      <TripList
        trips={trips}
        routes={routes}
        handleDel={handleDel}
        handleEdit={handleEdit}
        setTrips={setTrips}
        setIsLoading={setIsLoading}
        setAlertMessage={setAlertMessage}
        setAlertFlag={setAlertFlag}
      />

      {isLoading && <LoadingScreen />}
      <Overlay
        alertFlag={alertFlag}
        alertMessage={alertMessage}
        setAlertFlag={setAlertFlag}
      />
    </div>
  );
};

export default AddTrip;
