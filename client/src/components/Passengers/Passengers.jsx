import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./Passengers.css";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const PassengersPage = () => {
  const location = useLocation();
  const { busId } = location.state || {};

  const [seats, setSeats] = useState([]);
  const [userInfo, setUserInfo] = useState({});
  const [seatId, setSeatId] = useState("");
  const [showCancelOverlay, setShowCancelOverlay] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReservedPassengers = async () => {
    try {
      setLoading(true);

      const authResponse = await axios.get(`${backEndUrl}/auth`, {
        withCredentials: true,
      });
      const userID = authResponse.data.userId;
      setCurrentUser(userID);

      const response = await axios.post(`${backEndUrl}/seats/user/${busId}`, {
        userId: userID,
      });
      setSeats(response.data.data.finalSeatsArr || []);

      const userProfileResponse = await axios.get(
        `${backEndUrl}/user/profile/${userID}`
      );
      setUserInfo(userProfileResponse.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching reserved passengers:", error);
      setPassengers([]);
      setLoading(false);
    }
  };

  const handleSeatCancel = async () => {
    try {
      const cancelResponse = await axios.delete(
        `${backEndUrl}/formselection/${busId}`,
        {
          data: { seatId: seatId, userId: currentUser },
        }
      );

      if (cancelResponse.status === 200) {
        setSeats(seats.filter(seat => seat.seatId !== seatId)); // Remove passenger from the list
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
    setShowCancelOverlay(true);
  };

  const getRowColor = (index) => {
    const fullGroups = Math.floor(seats.length / 15);
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

      {seats.length > 0 ? (
        <div className="table-container" style={{ overflowX: "auto" }}>
          <table className="passenger-table">
            <colgroup>
              <col style={{ width: "10%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "10%" }} />
            </colgroup>

            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Route</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {seats.map((seat, idx) => {
                const rowColor = getRowColor(idx);
                return (
                  <tr key={idx} style={{ backgroundColor: rowColor }}>
                    {seat.currentUser ? (
                      <>
                        <td>{idx + 1}</td>
                        <td>{userInfo.name}</td>
                        <td>{seat.route}</td>
                        <td>
                          <button
                            className="cancel-button"
                            onClick={() =>
                              handleSeatSelection(seat.seatId, idx)
                            }
                          >
                            cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td colSpan={4}>{idx + 1}</td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="no-data">No reserved passengers found. {seats[0]}</p>
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
              <button
                className="cancel"
                onClick={() => setShowCancelOverlay(false)}
              >
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
