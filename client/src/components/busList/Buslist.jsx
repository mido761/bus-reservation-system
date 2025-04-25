import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Buslist.css";
const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const BusList = () => {
  const navigate = useNavigate();
  const [busList, setBusList] = useState([]);

  const fetchBusList = async () => {
    try {
      const response = await axios.get(`${backEndUrl}/buses`);
      setBusList(response.data.data); // Assuming response data contains buses in "data"
    } catch (error) {
      console.error("Error fetching bus list:", error);
    }
  };

  useEffect(() => {
    fetchBusList();
  }, []);

  const handleCancelBooking = async (busId) => {
    try {
      // Assuming there's an API endpoint for canceling a bus booking
      await axios.post(`${backEndUrl}/buses/cancel`, { busId });
      setBusList((prevList) => prevList.filter((bus) => bus._id !== busId)); // Remove bus from the list after cancel
    } catch (error) {
      console.error("Error canceling bus booking:", error);
    }
  };

  return (
    <div className="bus-list-page">
      <h2 className="title">Bus List</h2>
      
      {/* Check if busList is an array and has data */}
      {Array.isArray(busList) && busList.length > 0 ? (
        <div className="table-container" style={{ overflowX: "auto" }}>
          <table className="bus-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th style={{ padding: "10px", border: "1px solid #ccc" }}>#</th>
                <th style={{ padding: "10px", border: "1px solid #ccc" }}>User Name</th>
                <th style={{ padding: "10px", border: "1px solid #ccc" }}>Phone Number</th>
                <th style={{ padding: "10px", border: "1px solid #ccc" }}>Route</th>
                <th style={{ padding: "10px", border: "1px solid #ccc" }}>Check-in Status</th>
                <th style={{ padding: "10px", border: "1px solid #ccc" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {busList.map((bus, idx) => (
                <tr key={bus._id}>
                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>{idx + 1}</td>
                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>{bus.userName}</td>
                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>{bus.phoneNumber}</td>
                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>{bus.route}</td>
                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                    {bus.checkInStatus ? "Checked-in" : "Not Checked-in"}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                    <button
                      className="cancel-button"
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#e74c3c",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                      onClick={() => handleCancelBooking(bus._id)}
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="no-data">No buses available.</p>
      )}
    </div>
  );
};

export default BusList;
