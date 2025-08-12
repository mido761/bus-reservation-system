import { useState, useEffect } from "react";
import axios from "axios";
import LoadingScreen from "../../loadingScreen/loadingScreen";
import Overlay from "../../overlayScreen/overlay";
import "../formPage.css";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const Route = () => {
  const [stops, setStops] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [alertFlag, setAlertFlag] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // New state for adding a route
  const [newRoute, setNewRoute] = useState({
    source: "",
    destination: "",
    distance: 0,
    estimatedDuration: 0,
    stops: [],
    isActive: true,
  });

  const fetchStops = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`${backEndUrl}/stop/get-stops`);
      console.log(data);
      setStops(data);
    } catch (err) {
      setAlertMessage(err?.response?.data?.message || "Error fetching routes!");
      setAlertFlag(true);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoutes = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`${backEndUrl}/stop/get-stops`);
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
      const { data } = await axios.post(
        `${backEndUrl}/route/add-route`,
        newRoute
      );
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
    fetchStops();
  }, []);

  return (
    <div className="form-page-container">
      <form className="add-form" onSubmit={addRoute}>
        <h2>Add Route</h2>
        <label htmlFor="Source">
          Source
          <input
            type="text"
            placeholder="Source"
            value={newRoute.source}
            onChange={(e) =>
              setNewRoute({ ...newRoute, source: e.target.value })
            }
            required
          />
        </label>

        <label htmlFor="Destination">
          Destination{" "}
          <input
            type="text"
            placeholder="Destination"
            value={newRoute.destination}
            onChange={(e) =>
              setNewRoute({ ...newRoute, destination: e.target.value })
            }
            required
          />
        </label>

        <label htmlFor="Distance">
          Distance
          <input
            type="number"
            placeholder="Distance"
            value={newRoute.distance}
            onChange={(e) =>
              setNewRoute({ ...newRoute, distance: e.target.value })
            }
            required
          />
        </label>

        <label htmlFor="EstimatedDuration">
          Estimated Duration
          <input
            type="number"
            placeholder="Estimated Duration"
            value={newRoute.estimatedDuration}
            onChange={(e) =>
              setNewRoute({ ...newRoute, estimatedDuration: e.target.value })
            }
            required
          />
        </label>

        <label htmlFor="stops">
          Stops{" "}
          <select name="stops" id="stops" multiple>
            {/* <option value='default'>
              Choose Stops
            </option> */}
            {Array.isArray(stops) &&
              stops.map((stop) => (
                <option value={stop.stopName} key={stop._id}>
                  {stop.stopName}
                </option>
              ))}
          </select>
        </label>

        <button type="submit">Add Route</button>
      </form>

      <ul className="list">
        <h2>Routes List</h2>

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
