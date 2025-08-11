import { useState, useEffect } from "react";
import axios from "axios";
import LoadingScreen from "../../loadingScreen/loadingScreen";
import Overlay from "../../overlayScreen/overlay";
import "./bus.css";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const Bus = () => {
  const [buses, setBuses] = useState([]);
  const [alertFlag, setAlertFlag] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // New bus form state
  const [newBus, setNewBus] = useState({
    busNumber: "",
    capacity: ""
  });

  // Fetch all buses
  const fetchBuses = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${backEndUrl}/bus/get-buses`);
      setBuses(data);
    } catch (err) {
      setAlertMessage(err?.response?.data?.message || "Error fetching buses!");
      setAlertFlag(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new bus
  const addBus = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await axios.post(`${backEndUrl}/bus/add-bus`, newBus);
      setAlertMessage("Bus added successfully!");
      setAlertFlag(true);
      setNewBus({ busNumber: "", capacity: "" });
      fetchBuses();
    } catch (err) {
      setAlertMessage(err?.response?.data?.message || "Error adding bus!");
      setAlertFlag(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  return (
    <div className="bus-container">
      <h2>Available Buses</h2>

      {/* Add Bus Form */}
      <form className="add-bus-form" onSubmit={addBus}>
        <input
          type="text"
          placeholder="Bus Number"
          value={newBus.busNumber}
          onChange={(e) => setNewBus({ ...newBus, busNumber: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Capacity"
          value={newBus.capacity}
          onChange={(e) => setNewBus({ ...newBus, capacity: e.target.value })}
          required
        />
        <button type="submit">Add Bus</button>
      </form>

      {/* Bus List */}
      <ul className="bus-list">
      {Array.isArray(buses) && buses.map((bus) => (
  <li key={bus._id}>
    {bus.busNumber} — {bus.capacity} seats
  </li>
))}

      </ul>

      {isLoading && <LoadingScreen />}
      <Overlay
        alertFlag={alertFlag}
        alertMessage={alertMessage}
        setAlertFlag={setAlertFlag}
      />
    </div>
  );
};

export default Bus;
