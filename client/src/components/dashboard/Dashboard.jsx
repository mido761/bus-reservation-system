import React from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";

const Dashboard = ({ busDetails, error, userId }) => {
  const navigate = useNavigate();

  const handleBusSelect = (bus) => {
    navigate(`/seat-selection/${bus._id}`);
  };

  const convertTo12HourFormat = (time) => {
    if (!time) return "";
    const [hour, minute] = time.split(":");
    let hour12 = parseInt(hour);
    const period = hour12 >= 12 ? "PM" : "AM";
    if (hour12 === 0) hour12 = 12;
    if (hour12 > 12) hour12 -= 12;
    return `${hour12}:${minute} ${period}`;
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Your Reserved Buses</h2>
      <div className="dashboard-grid">
        {busDetails && busDetails.length > 0 ? (
          busDetails.map((bus, index) => (
            bus !== null && (
              <div className="dashboard-card" key={index} onClick={() => handleBusSelect(bus)}>
                <h3 className="bus-number">{bus.busNumber}</h3>
                <p>{bus.location.pickupLocation} → {bus.location.arrivalLocation}</p>
                <p>Date: {bus.schedule}</p>
                <p>Departure: {convertTo12HourFormat(bus.time.departureTime)}</p>
                <p>Your Seat(s): {
                  bus.seats.bookedSeats
                    .map((seat, index) => seat === userId ? index : null)
                    .filter(index => index !== null)
                    .join(", ") || "None"
                }</p>
              </div>
            )
          ))
        ) : (
          <p className="no-buses">No buses found.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;