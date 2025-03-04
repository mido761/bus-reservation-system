import React from "react";
import "./SeatLegend.css";

const SeatLegend = () => {
  return (
    <div className="seat-legend-container">
      <div className="legend-item">
        <span className="legend-color reserved"></span> Temporarily Reserved
      </div>
      <div className="legend-item">
        <span className="legend-color user-seat"></span> Your Seat
      </div>
      <div className="legend-item gender-legend">
        <div>
          <span className="legend-color girl"></span> Girls
        </div>
        <div>
          <span className="legend-color boy"></span> Boys
        </div>
      </div>
    </div>
  );
};

export default SeatLegend;
