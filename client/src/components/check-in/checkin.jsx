import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./checkin.css";
const backEndUrl = import.meta.env.VITE_BACK_END_URL;
import SeatLegend from "./seatlegend.jsx";

export default function Checkin() {
  const [seats, setSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [selectedSeatId, setSelectedSeatId] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [confirmationMsg, setConfirmationMsg] = useState("");

  // Example booked seats
  const { busId } = useParams();

  const fetchBusSeats = async () => {
    try {
      const seatsRes = await axios.get(
        `${backEndUrl}/seat/get-bus-seats/${busId}`
      );
      const busSeats = seatsRes.data.seats;
      const bookedSeats = busSeats
        .filter((seat) => seat.status !== "Available")
        .map((seat) => seat.seat_number);

      setBookedSeats(bookedSeats);
      setSeats(busSeats);
    } catch (err) {
      console.error("Error fetching bus seats: ", err);
    }
  };

  // Fetch buses
  useEffect(() => {
    fetchBusSeats();
  }, []);

  const seatLayout = [
    ["DRIVER", 1, 2], // 1st row
    [3, 4, 5, null], // 2nd row
    [6, 7, null, 8], // 3rd row
    [9, 10, null, 11], // 4th row
    [12, 13, 14, 15], // 5th row
  ];

  const handleSeatClick = (seat) => {
    if (seat && seat !== "DRIVER") {
      setSelectedSeat(seat);
      setSelectedSeatId(seats[seat - 1].seat_id);
    }
    console.log(seat);
    console.log(seats[seat - 1]);
  };

  const handleConfirmClick = () => {
    if (!selectedSeat) {
      setConfirmationMsg("⚠️ Please select a seat before confirming.");
      return;
    }
    setShowPopup(true);
  };

  const handlePopupConfirm = async () => {
    setShowPopup(false);
    try {
      const checkInRes = await axios.put(
        `${backEndUrl}/seat/check-in`,
        {
          seatId: selectedSeatId,
          busId: busId,
        },
        {
          withCredentials: true,
        }
      );
      console.log(checkInRes);
      setSeats((prevSeats) =>
        prevSeats.map((seatObj, idx) =>
          idx === selectedSeat - 1 ? { ...seatObj, status: "booked" } : seatObj
        )
      );
      setBookedSeats([...bookedSeats, selectedSeat]);
      setSelectedSeat(null);
      setSelectedSeatId("");
      alert(`✅ Seat ${selectedSeat} has been successfully reserved for you.`);
    } catch (err) {
      console.error("Error checking user in: ", err);
      alert(`Error checking user in:  ${err.response.data.message}`);
    }
  };

  const handleCancelSeat = async () => {
    setShowPopup(false);
    try {
      const cancelRes = await axios.put(
        `${backEndUrl}/seat/cancel-check-in`,
        {
          seatId: selectedSeatId,
          busId: busId,
        },
        {
          withCredentials: true,
        }
      );
      console.log(cancelRes);

      // Optimistic update for seat status
      setSeats((prevSeats) =>
        prevSeats.map((seatObj, idx) =>
          idx === selectedSeat - 1
            ? { ...seatObj, status: "available" }
            : seatObj
        )
      );

      // Optimistic update for booked seats
      const newBookedSeats = bookedSeats.filter(
        (seat) => seat !== selectedSeat
      );
      setBookedSeats(newBookedSeats);

      // Reset selections 
      setSelectedSeat(null);
      setSelectedSeatId("");
      alert(`❌ Seat ${selectedSeat} reservation cancelled.`);
    } catch (err) {
      console.error("Error cancelling seat: ", err);
      alert(
        `Error cancelling seat: ${err.response?.data?.message || err.message}`
      );
    }
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
                  : selectedSeat === seat
                  ? "selected"
                  : bookedSeats.includes(seat)
                  ? "booked"
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
            <h3>
              {seats[selectedSeat - 1]?.status === "booked"
                ? "Cancel Seat"
                : "Confirm Seat"}
            </h3>
            <p>
              You have selected <b>Seat {selectedSeat}</b>.
            </p>
            <div className="popup-actions">
              {seats[selectedSeat - 1]?.status !== "booked" ? (
                <button
                  className="popup-btn confirm"
                  onClick={handlePopupConfirm}
                >
                  Yes, Confirm
                </button>
              ) : (
                <button className="popup-btn cancel" onClick={handleCancelSeat}>
                  Cancel Seat
                </button>
              )}
              <button className="popup-btn" onClick={handlePopupCancel}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
