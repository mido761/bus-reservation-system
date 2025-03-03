import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./editBus";
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
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching bus data", error);
        setIsLoading(false);
      }
    };
    fetchBus();
  }, [busId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    setBusData((prevData) => {
      const updatedData = { ...prevData }; // Create a new object to avoid mutation
  
      if (name === "pickupLocation" || name === "arrivalLocation") {
        updatedData.location = { ...prevData.location, [name]: value };
      } else if (name === "departureTime" || name === "arrivalTime") {
        updatedData.time = { ...prevData.time, [name]: value };
      } else {
        updatedData[name] = value;
      }
  
      return updatedData;
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
      // Create busData object dynamically from form values
      setBusData((prevData) => {
        const updatedBusData = {
          location: { ...prevData.location },
          time: { ...prevData.time },
          schedule: prevData.schedule,
          price: prevData.price,
          busNumber: prevData.busNumber,
        };
    
        console.log("Sending updated bus data:", updatedBusData);
    
        axios
          .put(`${backEndUrl}/buses/edit-bus/${busId}`, updatedBusData)
          .then(() => {
            setAlertMessage("Bus updated successfully!");
            setAlertFlag(true);
            setTimeout(() => navigate("/bus-list"), 2000);
          })
          .catch((error) => {
            console.error("Error updating bus", error);
            setAlertMessage("⚠️ Error updating bus");
            setAlertFlag(true);
          })
          .finally(() => {
            setIsLoading(false);
          });
    
        return prevData; // Prevents unnecessary re-renders
      });
    };

  return (
    <div className="edit-bus-page">
      {isLoading ? (
        <LoadingScreen />
      ) : busData ? (
        <form onSubmit={handleSubmit} className="edit-bus-form">
          <h1>Edit Bus Details</h1>

          <label>Pickup location</label>
          <select name="pickupLocation" value={busData.location.pickupLocation} onChange={handleChange}>
            {locations.map((location) => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>

          <label>Arrival location</label>
          <select name="arrivalLocation" value={busData.location.arrivalLocation} onChange={handleChange}>
            {locations.map((location) => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>

          <label>Bus Number</label>
          <input type="text" name="busNumber" value={busData.busNumber} onChange={handleChange} />

          <label>Departure Time</label>
          <input type="time" name="departureTime" value={busData.time.departureTime} onChange={handleChange} />

          <label>Arrival Time</label>
          <input type="time" name="arrivalTime" value={busData.time.arrivalTime} onChange={handleChange} />

          <label>Price</label>
          <input type="number" name="price" value={busData.price} onChange={handleChange} />

          <label>Schedule</label>
          <input type="date" name="schedule" value={busData.schedule} onChange={handleChange} />

          <button type="submit">Update Bus</button>
        </form>
      ) : (
        <p>Bus not found.</p>
      )}

      <Overlay alertFlag={alertFlag} alertMessage={alertMessage} setAlertFlag={setAlertFlag} />
    </div>
  );
};

export default EditBus;
