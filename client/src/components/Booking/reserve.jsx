import { useLocation } from "react-router-dom";
import formatDateTime from "../../../formatDateAndTime";
import "./reserve.css";

const Reserve = () => {
  const location = useLocation();
  const { trip, route } = location.state || {};

  return (
    <div className="reserve-page">
      <h1>Reserve Your Trip</h1>
      {trip ? (
        <>
          <p><strong>Route:</strong> {route.source} → {route.destination}</p>
          <p><strong>Date:</strong> {trip.date}</p>
          <p><strong>Departure:</strong> {formatDateTime(trip.departure_time)}</p>
          <p><strong>Arrival:</strong> {formatDateTime(trip.arrival_time)}</p>

          <button className="confirm-btn">Confirm Reservation</button>
        </>
      ) : (
        <p className="no-trip">No trip selected.</p>
      )}
    </div>
  );
};

export default Reserve;
