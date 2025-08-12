// import "./AddBus.css";
import { useState, useEffect } from "react";
import axios from "axios";
import LoadingScreen from "../../loadingScreen/loadingScreen";
import Overlay from "../../overlayScreen/overlay";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const AddSchedule = () => {
  const [availableBuses, setAvailableBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [alertFlag, setAlertFlag] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchAvailableBuses = async () => {
    try {
      const buses = await axios.get(`${backEndUrl}/bus/get-available-buses`);

      setAvailableBuses(buses.data);
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
    fetchAvailableBuses();
    fetchRoutes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post(`${backEndUrl}/`, formData);

      setAlertMessage(successMessage); // Differs
      setAlertFlag(true);
    } catch (err) {
      setAlertMessage(err?.response?.data?.message || "Something went wrong");
      setAlertFlag(true);
    } finally {
      setIsLoading(false);
      setTimeout(() => setAlertFlag(false), 2200);
    }
  };

  const fields = [
    {
      name: "Bus",
      defaultValue: undefined,
      type: "select",
      options: availableBuses,
    },
    { name: "Route", defaultValue: undefined, type: "select", options: routes },
    { name: "Departure Date", defaultValue: "", type: "date" },
    { name: "DepartureTime", defaultValue: "", type: "time" },
    { name: "ArrivalTime", defaultValue: "", type: "time" },
  ];

  return (
    <div className="add-bus">
      <h1>Add New Schedule</h1>
      <form action="" onSubmit={handleSubmit}>
        <label htmlFor="buses">
          Available Buses
          <select name="buses" id="buses">
            <option value="default">Choose Bus</option>
            {Array.isArray(availableBuses) &&
              availableBuses.length > 0 &&
              availableBuses.map((bus) => (
                <option value="bus" key={bus._id}>
                  {bus.plateNumber}
                </option>
              ))}
          </select>
        </label>

        <label htmlFor="routes">
          Routes
          <select name="routes" id="routes">
            <option value="default">Choose Route</option>
            {Array.isArray(routes) &&
              routes.length > 0 &&
              routes.map((route) => (
                <option value="route" key={route._id}>
                  {route.source} ---- {route.destination}
                </option>
              ))}
          </select>
        </label>

        <label htmlFor="date">
          Departure Date
          <input type="date" name="date" />
        </label>
        <label htmlFor="departureTime">
          Departure Time
          <input type="time" name="departureTime" />
        </label>
        <label htmlFor="arrivalTime">
          Arrival Time
          <input type="time" name="arrivalTime" />
        </label>
      </form>

      {isLoading && <LoadingScreen />}
      <Overlay
        alertFlag={alertFlag}
        alertMessage={alertMessage}
        setAlertFlag={setAlertFlag}
      />
    </div>
  );
};

export default AddSchedule;
