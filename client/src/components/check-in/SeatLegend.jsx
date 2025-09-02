import React from "react";
import "./seatlegend.css";

export default function SeatLegend() {
  return (
    <div className="seat-legend">
      <div className="legend-item">
        <span className="seat sample booked"></span>
        <span>Booked</span>
      </div>
      <div className="legend-item">
        <span className="seat sample available"></span>
        <span>Available</span>
      </div>
      <div className="legend-item">
        <span className="seat sample selected"></span>
        <span>Selected</span>
      </div>
    </div>
  );
}
