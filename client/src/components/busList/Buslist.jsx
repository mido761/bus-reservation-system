import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Buslist.css";
import LoadingPage from "../loadingPage/loadingPage";
import LoadingComponent from "../loadingComponent/loadingComponent";
import LoadingScreen from "../loadingScreen/loadingScreen";
import Overlay from "../overlayScreen/overlay";
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

  const handleEditBus = (busId) => {
    navigate(`/admin/edit-bus`, { state: { busId } });
  };

  const handleDeleteBus = async (busId) => {
    try {
      await axios.delete(`${backEndUrl}/buses/${busId}`);
      setBusList((prevList) => prevList.filter((bus) => bus._id !== busId)); // Remove bus from the list
    } catch (error) {
      console.error("Error deleting bus:", error);
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
                <th style={{ padding: "10px", border: "1px solid #ccc" }}>Route</th>
                <th style={{ padding: "10px", border: "1px solid #ccc" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {busList.map((bus, idx) => (
                <tr key={bus._id}>
                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>{idx + 1}</td>
                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>{bus.busNumber}</td>
                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>{bus.route}</td>
                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                    <button
                      className="edit-button"
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#3498db",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                      onClick={() => handleEditBus(bus._id)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-button"
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#e74c3c",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        marginLeft: "8px",
                      }}
                      onClick={() => handleDeleteBus(bus._id)}
                    >
                      Delete
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
