import React, { useState } from "react";
import "./checkin.css";

export default function Checkin() {
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const seatLayout = [
    ["DRIVER", 1, 2],  // 1st row
    [3, 4, 5, null],         // 2nd row
    [6, 7, null, 8],         // 3rd row
    [9, 10, null, 11],       // 4th row
    [12, 13, 14, 15],        // 5th row
  ];

  const handleSeatClick = (seat) => {
    if (seat && seat !== "DRIVER") {
      setSelectedSeat(seat);
    }
  };

  const handleConfirmClick = () => {
    if (!selectedSeat) {
      alert("⚠️ Please select a seat before confirming.");
      return;
    }
    setShowPopup(true);
  };

  const handlePopupConfirm = () => {
    setShowPopup(false);
    alert(`✅ Seat ${selectedSeat} has been successfully reserved for you.`);
  };

  const handlePopupCancel = () => {
    setShowPopup(false);
  };

  return (
    <div className="checkin-container">
      <h2 className="checkin-title">Bus Seat Selection</h2>

      <div className="bus-diagram">
        {seatLayout.map((row, rowIndex) => (
          <div key={rowIndex} className="seat-row">
            {row.map((seat, seatIndex) => (
              <div
                key={seatIndex}
                className={`seat 
                  ${seat === "DRIVER" ? "driver" : ""} 
                  ${seat === null ? "empty" : ""} 
                  ${selectedSeat === seat ? "selected" : ""}`}
                onClick={() => handleSeatClick(seat)}
              >
                {seat === "DRIVER" ? "🚍 Driver" : seat}
              </div>
            ))}
          </div>
        ))}
      </div>

      <button className="confirm-btn" onClick={handleConfirmClick}>
        Confirm Selection
      </button>

      {/* Popup Modal */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Confirm Seat</h3>
            <p>Are you sure you want to select <b>Seat {selectedSeat}</b>?</p>
            <div className="popup-actions">
              <button className="popup-btn confirm" onClick={handlePopupConfirm}>
                Yes, Confirm
              </button>
              <button className="popup-btn cancel" onClick={handlePopupCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
