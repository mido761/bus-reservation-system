import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./editBus.css";
import LoadingScreen from "../loadingScreen/loadingScreen";
import Overlay from "../overlayScreen/overlay";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;
const locations = ["Ramses", "Dandy", "E-JUST", "Abaseya"];

const EditBus = () => {
  const { busId } = useParams();
  const navigate = useNavigate();
  const [busData, setBusData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [alertFlag, setAlertFlag] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    const fetchBus = async () => {
      try {
        const response = await axios.get(`${backEndUrl}/buses/${busId}`);
        setBusData(response.data);
      } catch (error) {
        console.error("Error fetching bus data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBus();
  }, [busId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBusData((prevData) => ({
      ...prevData,
      location: {
        ...prevData.location,
        [name]: name.includes("Location") ? value : prevData.location[name],
      },
      time: {
        ...prevData.time,
        [name]: name.includes("Time") ? value : prevData.time[name],
      },
      [name]:
        !name.includes("Location") && !name.includes("Time")
          ? value
          : prevData[name],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (window.confirm("Are you sure you want to update this bus?")) {
      setIsLoading(true);
      try {
        await axios.put(`${backEndUrl}/buses/edit-bus/${busId}`, busData);
        setAlertMessage("✅ Bus updated successfully!");
        setAlertFlag(true);
        setTimeout(() => navigate("/bus-list"), 2000);
      } catch (error) {
        console.error("Error updating bus", error);
        setAlertMessage("⚠️ Error updating bus");
        setAlertFlag(true);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="edit-bus-container">
      {isLoading ? (
        <LoadingScreen />
      ) : busData ? (
        <form onSubmit={handleSubmit} className="edit-bus-form">
          <h1>🚌 Edit Bus Details</h1>

          <div className="location-group">
            <div className="form-group">
              <label>Pickup Location</label>
              <select
                name="pickupLocation"
                value={busData.location.pickupLocation}
                onChange={handleChange}
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Arrival Location</label>
              <select
                name="arrivalLocation"
                value={busData.location.arrivalLocation}
                onChange={handleChange}
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Bus Number</label>
            <input
              type="text"
              name="busNumber"
              value={busData.busNumber}
              onChange={handleChange}
            />
          </div>

          <div className="time-group">
            <div className="form-group">
              <label>Departure Time</label>
              <input
                type="time"
                name="departureTime"
                value={busData.time.departureTime}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Arrival Time</label>
              <input
                type="time"
                name="arrivalTime"
                value={busData.time.arrivalTime}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Price</label>
            <input
              type="number"
              name="price"
              value={busData.price}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Schedule</label>
            <input
              type="date"
              name="schedule"
              value={busData.schedule}
              onChange={handleChange}
            />
          </div>

          <button type="submit">🚀 Update Bus</button>
        </form>
      ) : (
        <p>❌ Bus not found.</p>
      )}

      <Overlay
        alertFlag={alertFlag}
        alertMessage={alertMessage}
        setAlertFlag={setAlertFlag}
      />
    </div>
  );
};

export default EditBus;
