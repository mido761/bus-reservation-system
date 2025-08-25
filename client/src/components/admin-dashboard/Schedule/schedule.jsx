// import "./AddBus.css";
import { useState, useEffect } from "react";
import axios from "axios";
import LoadingScreen from "../../loadingScreen/loadingScreen";
import Overlay from "../../overlayScreen/overlay";
import formatDateTime from "../../../formatDateAndTime";
import "../formPage.css";

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
    departureDate: "",
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
          <select
            name="routeId"
            id="routes"
            onChange={(e) => {
              handleChange(e);
            }}
          >
            <option value="default">Choose Route</option>
            {Array.isArray(routes) &&
              routes.map((route) => (
                <option key={route.route_id} value={route.route_id}>
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

      {/* Trips List */}
      <div className="list-container">
        <h2>Trip List</h2>
        <ul className="list">
          {Array.isArray(trips) &&
            trips.map((trip) => (
              <li key={trip.trip_id}>
                {formatDateTime(trip.date, "date")}
                <br />
                {formatDateTime(trip.departure_time)} ----{" "}
                {formatDateTime(trip.arrival_time)}
                <br />
                {
                  routes.find((route) => route.route_id === trip.route_id)
                    ?.source
                }
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

export default AddTrip;
