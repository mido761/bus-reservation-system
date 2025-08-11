import { useState, useEffect } from "react";
import axios from "axios";
import LoadingScreen from "../../loadingScreen/loadingScreen";
import Overlay from "../../overlayScreen/overlay";
import "./route.css"
const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const Route = () => {
  const [routes, setRoutes] = useState([]);
  const [alertFlag, setAlertFlag] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // New state for adding a route
  const [newRoute, setNewRoute] = useState({
    name: "",
    start: "",
    end: ""
  });

  const fetchRoutes = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${backEndUrl}/route/get-routes`);
      setRoutes(data);
    } catch (err) {
      setAlertMessage(err?.response?.data?.message || "Error fetching routes!");
      setAlertFlag(true);
    } finally {
      setIsLoading(false);
    }
  };

  const addRoute = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const { data } = await axios.post(`${backEndUrl}/route/add-route`, newRoute);
      setAlertMessage("Route added successfully!");
      setAlertFlag(true);
      setNewRoute({ name: "", start: "", end: "" });
      fetchRoutes(); // Refresh list
    } catch (err) {
      setAlertMessage(err?.response?.data?.message || "Error adding route!");
      setAlertFlag(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  return (
    <div className="route-container">
      <h2>Available Routes</h2>

      <form className="add-route-form" onSubmit={addRoute}>
        <input
          type="text"
          placeholder="Route Name"
          value={newRoute.name}
          onChange={(e) => setNewRoute({ ...newRoute, name: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Start Location"
          value={newRoute.start}
          onChange={(e) => setNewRoute({ ...newRoute, start: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="End Location"
          value={newRoute.end}
          onChange={(e) => setNewRoute({ ...newRoute, end: e.target.value })}
          required
        />
        <button type="submit">Add Route</button>
      </form>

      <ul className="route-list">
        {routes.map((route) => (
          <li key={route._id}>
            {route.name} ({route.start} → {route.end})
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

export default Route;
