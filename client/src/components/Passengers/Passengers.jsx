import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const PassengersPage = () => {
  const location = useLocation();
  const { busId } = location.state || {};

  const [passengers, setPassengers] = useState([]);
  const [userSeats, setUserSeats] = useState([]);
  const [userInfo, setUserInfo] = useState({});
  const [seatId, setSeatId] = useState("");
  const [seatIndex, setSeatIndex] = useState("");
  const [showCancelOverlay, setShowCancelOverlay] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReservedPassengers = async () => {
    try {
      setLoading(true);

      const authResponse = await axios.get(`${backEndUrl}/auth`, { withCredentials: true });
      const userID = authResponse.data.userId;
      setCurrentUser(userID);

      const response = await axios.post(`${backEndUrl}/seats/user/${busId}`, { userId: userID });
      console.log("seat", response.data.data.userSeat)
      console.log("route", response.data.data.seatsRoute)
      setUserSeats(response.data.data.userSeat || []);
      setPassengers(response.data.data.seatsRoute || []);

      const userProfileResponse = await axios.get(`${backEndUrl}/user/profile/${userID}`);
      setUserInfo(userProfileResponse.data);
      console.log("profile", userProfileResponse.data)


      setLoading(false);
    } catch (error) {
      console.error("Error fetching reserved passengers:", error);
      setPassengers([]);
      setLoading(false);
    }
  };

  const handleSeatCancel = async () => {
    try {
      const cancelResponse = await axios.delete(`${backEndUrl}/formselection/${busId}`, {
        data: { seatId: seatId, userId: currentUser },
      });

      if (cancelResponse.status === 200) {
        // fetchReservedPassengers();
        setPassengers((prevList) =>
          prevList.filter((passenger, idx) => idx !== seatIndex)
        ); // Remove passenger from the list
        setShowCancelOverlay(false);
        setSeatId("");
      }
    } catch (error) {
      console.error("Error cancelling the seat", error);
      setShowCancelOverlay(false);
    }
  };

  const handleSeatSelection = (seatIdSelected, index) => {
    setSeatId(seatIdSelected);
    setSeatIndex(index)
    setShowCancelOverlay(true);
  };

  const getRowColor = (index) => {
    const fullGroups = Math.floor(passengers.length / 15);
    const lastGreenIndex = fullGroups * 15 - 1;
    return index <= lastGreenIndex ? "green" : "red";
  };

  useEffect(() => {
    if (busId) {
      fetchReservedPassengers();
    }
  }, [busId]);

  if (loading) {
    return <div>Loading your reservations...</div>;
  }

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
              {passengers.map((passenger, idx) => {
                const rowColor = getRowColor(idx);

                // Try to find if the current index belongs to the logged-in user
                const matchedSeat = userSeats.find(seat => seat[0] === idx + 1);
                console.log(matchedSeat)
                return (
                  <tr key={idx} style={{ backgroundColor: rowColor }}>
                    <td style={{ padding: "10px", border: "1px solid #ccc", textAlign: "center" }}>
                      {idx + 1}
                    </td>

                    {matchedSeat ? (
                      <>
                        <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                          {passenger}
                        </td>
                        <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                          {matchedSeat[1]}
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
                            onClick={() => handleSeatSelection(passenger, idx)}
                          >
                            Cancel Seat
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                        </td>
                        <td style={{ padding: "10px", border: "1px solid #ccc", textAlign: "center" }}>
                          <span></span>
                        </td>
                        <td style={{ padding: "10px", border: "1px solid #ccc", textAlign: "center" }}>
                          <span></span>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
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
            <p>Are you sure you want to cancel the seat?</p>
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
