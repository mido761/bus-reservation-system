import React, { useState } from "react";
import "./checkin.css";
import SeatLegend from "./seatlegend.jsx";

export default function Checkin() {
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [confirmationMsg, setConfirmationMsg] = useState("");

  // Example booked seats
  const bookedSeats = [8, 12];

  const seatLayout = [
    ["DRIVER", 1, 2],
    [3, 4, 5, null],
    [6, 7, null, 8],
    [9, 10, null, 11],
    [12, 13, 14, 15],
  ];

  const handleSeatClick = (seat) => {
    if (seat && seat !== "DRIVER" && !bookedSeats.includes(seat)) {
      setSelectedSeat(seat);
    }
  };

  const handleConfirmClick = () => {
    if (!selectedSeat) {
      setConfirmationMsg("⚠️ Please select a seat before confirming.");
      return;
    }
    setShowPopup(true);
  };

  const handlePopupConfirm = () => {
    setShowPopup(false);
    setConfirmationMsg(`✅ Seat ${selectedSeat} has been successfully reserved for you.`);
  };

  const handlePopupCancel = () => {
    setShowPopup(false);
  };

  const handleReset = () => {
    setSelectedSeat(null);
    setConfirmationMsg("");
  };

  return (
    <div className="checkin-container">
      <h2 className="checkin-title">Bus Seat Selection</h2>

      <SeatLegend /> {/* ✅ Seat legend */}

      <div className="bus-diagram">
        {seatLayout.map((row, rowIndex) => (
          <div key={rowIndex} className="seat-row">
            {row.map((seat, seatIndex) => {
              const seatClass =
                seat === "DRIVER"
                  ? "driver"
                  : seat === null
                  ? "empty"
                  : bookedSeats.includes(seat)
                  ? "booked"
                  : selectedSeat === seat
                  ? "selected"
                  : "available";

              return (
                <div
                  key={seatIndex}
                  className={`seat ${seatClass}`}
                  onClick={() => handleSeatClick(seat)}
                >
                  {seat === "DRIVER" ? "🚍 Driver" : seat}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="actions">
        <button className="confirm-btn" onClick={handleConfirmClick}>
          Confirm Selection
        </button>
        <button className="reset-btn" onClick={handleReset}>
          Reset
        </button>
      </div>

      {/* Confirmation message */}
      {confirmationMsg && (
        <div className="confirmation-message">{confirmationMsg}</div>
      )}

      {/* Popup Modal */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Confirm Seat</h3>
            <p>
              Are you sure you want to select <b>Seat {selectedSeat}</b>?
            </p>
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
