import React from "react";
import "./SeatLegend.css";

const SeatLegend = () => {
  return (
    <div className="seat-legend-container">
      <div className="legend-item">
        <span className="legend-color booked"></span> Booked Seat
      </div>
      <div className="legend-item">
        <span className="legend-color reserved"></span> Temporarily Reserved
      </div>
      <div className="legend-item">
        <span className="legend-color user-seat"></span> Your Seat
      </div>
    </div>
  );
};

export default SeatLegend;
