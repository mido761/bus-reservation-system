import React from "react";
import "./Trips.css";

const Trips = ({ buses, isLoading, onSeePassengers, onBook, convertTo12HourFormat }) => {
  if (isLoading) return <div className="bus-list-loading">Loading...</div>;
  return (
    <div className="bus-list">
      <h2>Available Buses</h2>
      {buses.length ? (
        buses.map((bus, index) => (
          <div
            key={bus._id}
            className={`bus-container ${buses.length > 1 && index === 0 ? "top-margin" : "64px"}`}
          >
            <button
              className="list-btn top-right-btn"
              onClick={() => onSeePassengers(bus)}
            >
              <img src="arrow.png" alt="See Passengers" />
            </button>
            <div className="list-body">
              <p>{bus.route_id}</p>
              <p>{bus.date}</p>
              {/* <p>Time: {convertTo12HourFormat(bus.departureTime)}</p> */}
            </div>
            <button onClick={() => onBook(bus)}>
              Book a seat
            </button>
          </div>
        ))
      ) : (
        <p>No buses found matching your criteria.</p>
      )}
    </div>
  );
};

export default Trips;

