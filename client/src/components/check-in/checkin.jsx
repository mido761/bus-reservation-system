import React, { useEffect, useState } from "react";
import QRCode from "qrcode.react"; 
import "./checkin.css";

const backendUrl = import.meta.env.VITE_BACK_END_URL;

const seatLayout = [
  ["driver", "1", "2", null],
  ["3", "4", "5", null],
  ["6", "7", null, "8"],
  ["9", "10", null, "11"],
  ["12", "13", "14", "15"],
];

export default function Checkin() {
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmedSeat, setConfirmedSeat] = useState(null);

  // Fetch buses
  useEffect(() => {
    fetch(`${backendUrl}/bus`)
      .then((res) => res.json())
      .then((data) => {
        if (data.buses) {
          const busesWithQr = data.buses.map((bus) => ({
            ...bus,
            qrUrl: `http://localhost:5173/#/checkin?bus_id=${bus.bus_id}`,
          }));
          setBuses(busesWithQr);
        }
      })
      .catch((err) => console.error("Error fetching buses:", err));
  }, []);

  // Seat handling
  const handleSeatClick = (seat) => {
    if (seat && seat !== "driver") {
      setSelectedSeat(seat);
      setConfirming(true);
    }
  };

  const handleConfirm = () => {
    setConfirmedSeat(selectedSeat);
    setConfirming(false);
  };

  const handleCancel = () => {
    setSelectedSeat(null);
    setConfirming(false);
  };

  return (
    <div className="checkin-container">
      {!selectedBus ? (
        <>
          <h2>Bus Dashboard</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
            {buses.map((bus) => (
              <div
                key={bus.bus_id}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "10px",
                  padding: "15px",
                  textAlign: "center",
                  cursor: "pointer",
                }}
                onClick={() => setSelectedBus(bus)}
              >
                <h4>{bus.plate_number}</h4>
                <QRCode value={bus.qrUrl} size={120} />
                <p style={{ fontSize: "12px", wordBreak: "break-all" }}>
                  {bus.qrUrl}
                </p>
                <button style={{ marginTop: "10px" }}>Check-in</button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <h2 className="checkin-title">
            Seat Check-In for Bus {selectedBus.plate_number}
          </h2>
          <div className="seat-diagram">
            {seatLayout.map((row, rowIdx) => (
              <div className="seat-row" key={rowIdx}>
                {row.map((seat, colIdx) => {
                  if (seat === null) {
                    return <div className="seat-empty" key={colIdx}></div>;
                  }
                  if (seat === "driver") {
                    return (
                      <div className="seat-driver" key={colIdx}>
                        <span role="img" aria-label="driver">
                          🧑‍✈️
                        </span>
                        <div className="driver-label">Driver</div>
                      </div>
                    );
                  }
                  return (
                    <button
                      className={`seat-btn${
                        selectedSeat === seat ? " selected" : ""
                      }${confirmedSeat === seat ? " confirmed" : ""}`}
                      key={colIdx}
                      onClick={() => handleSeatClick(seat)}
                      disabled={confirmedSeat === seat}
                    >
                      {seat}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {confirming && (
            <div className="confirm-modal">
              <div className="confirm-box">
                <p>
                  Confirm seat <b>{selectedSeat}</b>?
                </p>
                <button className="confirm-btn" onClick={handleConfirm}>
                  Confirm
                </button>
                <button className="cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {confirmedSeat && (
            <div className="confirmed-message">
              Seat <b>{confirmedSeat}</b> confirmed!
            </div>
          )}

          <button
            style={{ marginTop: "20px" }}
            onClick={() => {
              setSelectedBus(null);
              setSelectedSeat(null);
              setConfirmedSeat(null);
            }}
          >
            Back to Buses
          </button>
        </>
      )}
    </div>
  );
}
