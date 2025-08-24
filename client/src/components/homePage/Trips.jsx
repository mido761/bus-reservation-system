import React from "react";
import "./Trips.css";

const Trips = ({ trips, isLoading, onSeePassengers, onBook, convertTo12HourFormat, route }) => {
  if (isLoading) return <div className="trip-list-loading">Loading...</div>;
  return (
    <div className="trip-list">
      <h2>Available Trips</h2>
      {trips.length ? (
        trips.map((trip, index) => (
          <div
            key={trip._id}
            className={`trip-container ${trips.length > 1 && index === 0 ? "top-margin" : "64px"}`}
          >
            <button
              className="list-btn top-right-btn"
              onClick={() => onSeePassengers(trip)}
            >
              <img src="arrow.png" alt="See Passengers" />
            </button>
            <div className="list-body">
              <p>{route.source}</p>
              <p>{route.destination}</p>
              <p>{trip.date}</p>
              <p>{trip.departure_time}</p>
              <p>{route.estimated_duration}</p>

              {/* <p>Time: {convertTo12HourFormat(trip.departureTime)}</p> */}
            </div>
            <button onClick={() => onBook(trip)}>
              Book a seat
            </button>
          </div>
        ))
      ) : (
        <p>No trips found matching your criteria.</p>
      )}
    </div>
  );
};

export default Trips;

