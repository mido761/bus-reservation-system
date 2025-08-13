import { useState, useEffect } from "react";
import axios from "axios";
import LoadingScreen from "../../loadingScreen/loadingScreen";
import Overlay from "../../overlayScreen/overlay";
// import "./stops.css";
import "../formPage.css";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const Stops = () => {
  const [stops, setStops] = useState([]);
  const [alertFlag, setAlertFlag] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // New stop form state
  const [newStop, setNewStop] = useState({
    stopName: "",
    location: "",
  });

  // Fetch all stops
  const fetchStops = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${backEndUrl}/stop/get-stops`);
      setStops(data);
    } catch (err) {
      setAlertMessage(err?.response?.data?.message || "Error fetching stops!");
      setAlertFlag(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Add new stop
  const addStop = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await axios.post(`${backEndUrl}/stop/add-stop`, newStop);
      setAlertMessage("Stop added successfully!");
      setAlertFlag(true);
      setNewStop({ stopName: "", location: "" });
      fetchStops();
    } catch (err) {
      setAlertMessage(err?.response?.data?.message || "Error adding stop!");
      setAlertFlag(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStops();
  }, []);

  return (
    <div className="form-page-container">
      {/* Add Stop Form */}
      <form className="add-form" onSubmit={addStop}>
        <h2>Add Stop</h2>
        <label htmlFor="StopName">
          Stop Name
          <input
            type="text"
            placeholder="Stop Name"
            value={newStop.stopName}
            onChange={(e) =>
              setNewStop({ ...newStop, stopName: e.target.value })
            }
            required
          />
        </label>

        <label htmlFor="Location">
          Location
          <input
            type="text"
            placeholder="Location"
            value={newStop.location}
            onChange={(e) =>
              setNewStop({ ...newStop, location: e.target.value })
            }
            required
          />
        </label>

        <button type="submit">Add Stop</button>
      </form>

      {/* Stops List */}
      <div className="list-container">
        <h2>Stops List</h2>

        <ul className="list">
          {stops.map((stop) => (
            <li key={stop._id}>
              {stop.stopName} — {stop.location}
            </li>
          ))}
        </ul>
      </div>
      {isLoading && <LoadingScreen />}
      <Overlay
        alertFlag={alertFlag}
        alertMessage={alertMessage}
        setAlertFlag={setAlertFlag}
      />
    </div>
  );
};

export default Stops;
