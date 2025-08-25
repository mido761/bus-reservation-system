import React from "react";
import "./Trips.css";

const Trips = ({ trips, isLoading, onBook, onSeePassengers, convertTo12HourFormat, route, hasSearched }) => {
  if (!hasSearched) return null;
  if (isLoading) return <div className="trip-list-loading">Loading...</div>;

  return (
    <div className="trip-card">
      <div className="trip-header">
        <span className="bus-icon">🚌</span>
        <h2>Available Buses</h2>
      </div>

      {trips.length > 0 ? (
        trips.map((trip, index) => (
          <div key={trip._id || index} className="trip-item">
            <div className="trip-info">
              <p><strong>From:</strong> {trip.source || route?.source}</p>
              <p><strong>To:</strong> {trip.destination || route?.destination}</p>
              <p><strong>Date:</strong> {trip.date}</p>
              <p>
                <strong>Time:</strong>{" "}
                {convertTo12HourFormat
                  ? convertTo12HourFormat(trip.departure_time)
                  : trip.departure_time}
              </p>
            </div>
            <div className="trip-actions">
              <button className="reserve-btn" onClick={() => onBook(trip)}>
                Reserve
              </button>
              <button className="passengers-btn" onClick={() => onSeePassengers(trip)}>
                Passengers List
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="no-trips">No trips found.</p>
      )}
    </div>
  );
};

export default Trips;
