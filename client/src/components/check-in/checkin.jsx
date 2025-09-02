import React, { useEffect, useState } from "react";

const backendUrl = import.meta.env.VITE_BACK_END_URL; // your backend API base

export default function Checkin() {
  const [buses, setBuses] = useState([]);

  useEffect(() => {
    fetch(`${backendUrl}/bus`)  // your getAvailableBuses endpoint
      .then((res) => res.json())
      .then((data) => {
        if (data.buses) {
          // attach qrUrl for each bus
          const busesWithQr = data.buses.map((bus) => ({
            ...bus,
            qrUrl: `http://localhost:5173/#/checkin?bus_id=${bus.bus_id}`,
          }));
          setBuses(busesWithQr);
        }
      })
      .catch((err) => console.error("Error fetching buses:", err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
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
            }}
          >
            <h4>{bus.plate_number}</h4>
            <QRCode value={bus.qrUrl} size={150} />
            <p style={{ fontSize: "12px", wordBreak: "break-all" }}>
              {bus.qrUrl}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
