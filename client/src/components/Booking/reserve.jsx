import { useLocation } from "react-router-dom";
import { useState,useEffect } from "react";
import axios from "axios";
import formatDateTime from "../../../formatDateAndTime";
import "./reserve.css";
const backEndUrl = import.meta.env.VITE_BACK_END_URL;
const Reserve = () => {
  const location = useLocation();
  const { trip, route } = location.state || {};
  const [stops, setStops] = useState([])
  useEffect(() => {
    const fetchStops = async () => {
      try {
        const res = await axios.get(`${backEndUrl}/stop/get-stops-route/${route.route_id}`);
        console.log(res.data.stops)
        setStops(res.data.stops);
      } catch (err) {
        setStops([]);
      }
    };

    fetchStops();
  }, []);

  return (
    <div className="reserve-page">
      <h1>Reserve Your Trip</h1>
      {trip ? (
        <>
          <p><strong>Route:</strong> {route.source} → {route.destination}</p>
          <p><strong>Date:</strong> {trip.date}</p>
          <p><strong>Departure:</strong> {trip.departure_time}</p>
          <p><strong>Arrival:</strong> {trip.arrival_time}</p>

          <button className="confirm-btn">Confirm Reservation</button>
        </>
      ) : (
        <p className="no-trip">No trip selected.</p>
      )}
    </div>
  );
};

export default Reserve;
