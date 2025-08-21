// import "./AddBus.css";
import { useState, useEffect } from "react";
import axios from "axios";
import LoadingScreen from "../../loadingScreen/loadingScreen";
import Overlay from "../../overlayScreen/overlay";
import "../formPage.css";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const AddSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [availableBuses, setAvailableBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [alertFlag, setAlertFlag] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    // busIds: [], // array of bus IDs
    routeId: "", // array of route IDs
    departureDate: "",
    departureTime: "",
    arrivalTime: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle multiple select separately
    if (name === "busIds" || name === "routeIds") {
      const values = Array.from(
        e.target.selectedOptions,
        (option) => option.value
      );
      setFormData((prev) => ({ ...prev, [name]: values }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const fetchSchedules = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${backEndUrl}/schedule/get-schedules`);

      setSchedules(data);
    } catch (err) {
      setAlertMessage(
        err?.response?.data?.message || "Error fetching Schedules!"
      );
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
    fetchAvailableBuses();
    fetchRoutes();
    fetchSchedules();
  }, []);

  const formatDateTime = (time, type) => {
    const DateTime = new Date(time).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const DateOnly = new Date(time).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const TimeOnly = new Date(time).toLocaleString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return type === "dateTime"
      ? DateTime
      : type === "date"
      ? DateOnly
      : TimeOnly;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post(`${backEndUrl}/schedule/add-schedule`, formData);

      setSchedules((prev) => [...prev, formData]);
      setAlertMessage("Schedule Added Successfully"); // Differs
      setAlertFlag(true);
      fetchSchedules();
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
      <form action="" onSubmit={handleSubmit} className="add-form">
        <h2>Add Trip</h2>
        
        {/* <label htmlFor="buses">
          Available Buses
          <select name="busIds" id="buses" multiple onChange={handleChange}>
            {Array.isArray(availableBuses) && availableBuses.map((bus) => (
              <option key={bus._id} value={bus._id}>
                {bus.plateNumber}
              </option>
            ))}
          </select>
        </label> */}

        <label htmlFor="routes">
          Routes
          <select name="routeIds" id="routes" onChange={handleChange}>
            {Array.isArray(routes) && routes.map((route) => (
              <option key={route._id} value={route._id}>
                {route.source} ---- {route.destination}
              </option>
            ))}
          </select>
        </label>

        <label>
          Departure Date
          <input type="date" name="departureDate" onChange={handleChange} />
        </label>

        <label>
          Departure Time
          <input type="time" name="departureTime" onChange={handleChange} />
        </label>

        <label>
          Arrival Time
          <input type="time" name="arrivalTime" onChange={handleChange} />
        </label>

        <button type="submit">Add Trip</button>
      </form>

      {/* Schedules List */}
      <div className="list-container">
        <h2>Trip List</h2>
        <ul className="list">
          {Array.isArray(schedules) &&
            schedules.map((schedule) => (
              <li key={schedule._id}>
                {formatDateTime(schedule.departure, "date")}
                <br />
                {formatDateTime(schedule.departure)} ----{" "}
                {formatDateTime(schedule.arrival)}
                <br />
                {schedule.routeIds
                  .map(
                    (id) =>
                      routes?.find(
                        (route) => route._id.toString() === id.toString()
                      )?.source
                  )
                  .join("---")}{" "}
                <br />
                {schedule.busIds.map(
                  (id) =>
                    availableBuses?.find((bus) => bus._id === id)?.plateNumber
                )}
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

export default AddSchedule;
