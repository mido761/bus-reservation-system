import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const PassengersPage = () => {
  const location = useLocation();
  const { busId } = location.state || {}; // Get the busId from the state passed via navigate
  const [passengers, setPassengers] = useState([]);
  const [seatBookings, setSeatBookings] = useState([]);
  const [passengerName, setPassengerName] = useState("");
  const [passengerId, setPassengerId] = useState("");
  const [seatId, setSeatId] = useState("");
  const [showCancelOverlay, setShowCancelOverlay] = useState(false);
  const [loggedInUserId, setLoggedInUserId] = useState("");

  const fetchReservedPassengers = async () => {
    try {
      const authResponse = await axios.get(`${backEndUrl}/auth`, {
        withCredentials: true,
      });
      const userId = authResponse.data.userId; // user ID from the session
      setLoggedInUserId(userId);

      const response = await axios.get(`${backEndUrl}/seats/${busId}`);
      const seatBookings = response.data.data;
      setSeatBookings(seatBookings);

      // Ids with duplication
      const bookedByIds = seatBookings.map((item) => item.bookedBy);

      // Ids with NO duplication
      const uniqueIds = [...new Set(bookedByIds)];

      // Names response with no duplications
      const passengersNamesResponse = await axios.post(
        `${backEndUrl}/user/profilesNames`,
        { userIds: uniqueIds }
      );

      // Users Ids and names
      const users = passengersNamesResponse.data;

      // Create a map for fast lookup by user ID
      const userMap = users.reduce((acc, user) => {
        acc[user._id] = user;
        return acc;
      }, {});

      const result = seatBookings
        .map((booking) => userMap[booking.bookedBy])
        .filter((passenger) => passenger._id === userId); // Only show logged-in user's data

      setPassengers(result);
    } catch (error) {
      console.error("Error fetching reserved passengers:", error);
      setPassengers([]);
    }
  };

  const handleSeatSellection = (passengerId, index, passengerName) => {
    const seatData = seatBookings[index];
    setShowCancelOverlay(true);
    setPassengerName(passengerName);
    setSeatId(seatData._id);
    setPassengerId(passengerId);
  };

  const handleSeatCancel = async () => {
    try {
      const cancelResponse = await axios.delete(
        `${backEndUrl}/formselection/${busId}`,
        { data: { seatId: seatId, userId: loggedInUserId } }
      );

      if (cancelResponse.status === 200) {
        fetchReservedPassengers();
        setShowCancelOverlay(false);
        setPassengerName("");
        setSeatId("");
        setPassengerId("");
      }
    } catch (error) {
      console.error("Error cancelling the seat", error);
      setShowCancelOverlay(false);
    }
  };

  useEffect(() => {
    if (busId) {
      fetchReservedPassengers();
    }
  }, [busId]);

  const getRouteName = (busId) => {
    if (busId?.startsWith("DANDY")) return "Dandy";
    if (busId?.startsWith("RAMSIS")) return "Ramsis";
    return "Unknown";
  };

  const getRowColor = (index) => {
    return index < 15 ? "#2ecc71" : "#e74c3c"; // Green for the first 15, Red for the others
  };

  return (
    <div className="passengers-page">
      <h2 className="title">Reserved Passengers</h2>

      {passengers.length > 0 ? (
        <div className="table-container" style={{ overflowX: "auto" }}>
          <table
            className="passenger-table"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "600px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th style={{ padding: "10px", border: "1px solid #ccc" }}>#</th>
                <th style={{ padding: "10px", border: "1px solid #ccc" }}>Name</th>
                <th style={{ padding: "10px", border: "1px solid #ccc" }}>Route</th>
                <th style={{ padding: "10px", border: "1px solid #ccc" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {passengers.map((passenger, idx) => (
                <tr key={idx}>
                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                    {idx + 1}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                    {passenger.name}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                    {getRouteName(busId)}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                    <button
                      className="cancel-button"
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#ff4d4f",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        handleSeatSellection(passenger._id, idx, passenger.name)
                      }
                    >
                      Cancel Seat
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="no-data">No reserved passengers found.</p>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelOverlay && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Cancel Booking</h3>
            <p>
              Are you sure you want to cancel the seat for{" "}
              <strong>{passengerName}</strong>?
            </p>
            <div className="modal-actions">
              <button className="confirm" onClick={handleSeatCancel}>
                Yes, Cancel
              </button>
              <button className="cancel" onClick={() => setShowCancelOverlay(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengersPage;
