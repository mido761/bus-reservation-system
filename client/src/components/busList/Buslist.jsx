import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingComponent from "../loadingComponent/loadingComponent";
import LoadingScreen from "../loadingScreen/loadingScreen";
import LoadingPage from "../loadingPage/loadingPage";
import Overlay from "../overlayScreen/overlay";
import "./Buslist.css";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const BusList = () => {
  const [busList, setBusList] = useState([]);
  const [selectedBusId, setSelectedBusId] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [seatList, setSeatList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [alertFlag, setAlertFlag] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [selectedPassenger, setSelectedPassenger] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const navigate = useNavigate();

  const fetchBusList = async () => {
    try {
      const response = await axios.get(`${backEndUrl}/buses`);
      setBusList(response.data);
      setPageLoading(false);
    } catch (error) {
      console.error("Error fetching bus list:", error);
      setPageLoading(false);
    }
  };

  const fetchPassengersForBus = async (busId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${backEndUrl}/seats/${busId}`);
      setSeatList(
        Array.isArray(response.data.data.seats) ? response.data.data.seats : []
      );
      setPassengers(
        Array.isArray(response.data.data.orderedUsers)
          ? response.data.data.orderedUsers
          : []
      );
      setLoading(false);
    } catch (error) {
      console.error("Error fetching passengers for bus:", error);
      setSeatList([]);
      setLoading(false);
    }
  };

  const handleBusSelect = (busId) => {
    setSelectedBusId(busId === selectedBusId ? null : busId);
    if (busId !== selectedBusId) fetchPassengersForBus(busId);
  };

  const handlePassengerClick = (passenger, seat) => {
    setSelectedPassenger(passenger);
    setSelectedSeat(seat);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedPassenger(null);
    setSelectedSeat(null);
  };

  useEffect(() => {
    fetchBusList();
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredPassengers = passengers.filter((passenger, idx) => {
    const query = searchQuery.toLowerCase().trim();
    const userName = passenger?.name?.toLowerCase() || "";
    const phoneNumber = (String(passenger?.phoneNumber) || "").toLowerCase();
    const route = seatList[idx]?.route?.toLowerCase() || "";

    return (
      userName.includes(query) ||
      phoneNumber.includes(query) ||
      route.includes(query)
    );
  });

  const calculateTimeDifference = (reservedTime) => {
    const now = new Date();
    const reservedDate = new Date(reservedTime);

    const timeDiff = now - reservedDate;
    const minutes = Math.floor(timeDiff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} days ago`;
    if (hours > 0) return `${hours} hours ago`;
    return `${minutes} minutes ago`;
  };

  const handleCancelBooking = async (busId, userId, seatId, index) => {
    setIsLoading(true);
    try {
      const authResponse = await axios.get(`${backEndUrl}/auth`, {
        withCredentials: true,
      });
      const userID = authResponse.data.userId;

      const cancelResponse = await axios.delete(
        `${backEndUrl}/formselection/${busId}`,
        { data: { seatId: seatId, userId: userID } }
      );

      if (cancelResponse.status === 200) {
        setSeatList((prevList) =>
          prevList.filter((seat) => seat._id !== seatId)
        );
        setPassengers((prevList) =>
          prevList.filter((passenger, idx) => idx !== index)
        );

        setIsLoading(false);
        setSelectedBusId("");
        setAlertMessage("✅ Seat canceled successfully!");
        setAlertFlag(true);
        setShowPopup(false);

        setTimeout(() => {
          setAlertFlag(false);
        }, 2200);
      }
    } catch (error) {
      console.error("Error canceling passenger booking:", error);
      setIsLoading(false);
      setAlertMessage("⚠️ Error canceling the seat!");
      setAlertFlag(true);

      setTimeout(() => {
        setAlertFlag(false);
      }, 2200);
    }
  };

  const convertTo12HourFormat = (time) => {
    if (!time) return "";
    const [hour, minute] = time.split(":");
    let period = "AM";
    let hour12 = parseInt(hour, 10);

    if (hour12 >= 12) {
      period = "PM";
      if (hour12 > 12) hour12 -= 12;
    }
    if (hour12 === 0) hour12 = 12;

    return `${hour12}:${minute} ${period}`;
  };

  const handleEdit = (busId) => {
    navigate(`/edit-bus/${busId}`);
  };

  const handleDel = async (busId) => {
    const firstConfirmation = window.confirm(
      "Are you sure you want to delete this bus?"
    );
    if (!firstConfirmation) return;

    const secondConfirmation = window.confirm(
      "This action cannot be undone. Do you want to proceed?"
    );
    if (!secondConfirmation) return;

    setIsLoading(true);
    try {
      await axios.delete(`${backEndUrl}/buses/busForm/${busId}`);
      setBusList(busList.filter((bus) => bus._id !== busId));

      setIsLoading(false);
      setSelectedBusId("");
      setAlertMessage("✅ Bus deleted successfully!");
      setAlertFlag(true);

      setTimeout(() => {
        setAlertFlag(false);
      }, 2200);
    } catch (err) {
      setIsLoading(false);
      setAlertMessage("⚠️ Error deleting the bus");
      setAlertFlag(true);

      setTimeout(() => {
        setAlertFlag(false);
      }, 2200);
    }
  };

  if (pageLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="bus-list-page">
      <div className="bus-selection">
        <h3>Select a Bus</h3>
        {busList.length > 0 ? (
          <ul className="bus-list">
            {busList.map((bus) => (
              <li key={bus._id}>
                <button
                  className={`bus-btn ${
                    selectedBusId === bus._id ? "bus-btn-selected" : ""
                  }`}
                  onClick={() => handleBusSelect(bus._id)}
                >
                  <div className="time-and-schedule">
                    <p>{convertTo12HourFormat(bus.departureTime)}</p>
                    <p>{bus.schedule}</p>
                  </div>
                  <div>
                    <span className="routeName">
                      {bus.location.pickupLocation}
                    </span>
                    &nbsp;to&nbsp;
                    <span className="routeName">
                      {bus.location.arrivalLocation}
                    </span>
                  </div>
                </button>
                {selectedBusId === bus._id && (
                  <div className="bus-details-dropdown">
                    <div className="search-bar">
                      <input
                        type="text"
                        placeholder="Search by username"
                        value={searchQuery}
                        onChange={handleSearchChange}
                      />
                    </div>
                    {loading ? (
                      <LoadingComponent />
                    ) : Array.isArray(filteredPassengers) &&
                      filteredPassengers.length > 0 ? (
                      <div className="table-container">
                        <table className="passenger-table">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>User Name</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredPassengers.map((passenger, idx) => {
                              const seat =
                                seatList[passengers.indexOf(passenger)];
                              return (
                                <tr key={idx}>
                                  <td>{idx + 1}</td>
                                  <td
                                    onClick={() =>
                                      handlePassengerClick(passenger, seat)
                                    }
                                  >
                                    {passenger.name}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="no-data">
                        No passengers found matching your search.
                      </p>
                    )}
                    <div className="actions-container">
                      <button
                        className="action-button del-btn"
                        onClick={() => handleDel(bus._id)}
                      >
                        <img
                          className="action-icon"
                          src="delete.png"
                          alt="Delete"
                        />
                      </button>
                      <button
                        className="action-button edit-btn"
                        onClick={() => handleEdit(bus._id)}
                      >
                        <img
                          className="action-icon"
                          src="editing.png"
                          alt="Edit"
                        />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-data">No Buses found.</p>
        )}
      </div>

      {/* Enhanced Popup Modal */}
      {showPopup && selectedPassenger && selectedSeat && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button className="close-button" onClick={closePopup}>
              ×
            </button>
            <h3>Passenger Details</h3>
            <div className="passenger-details-grid">
              <div className="detail-label">Name:</div>
              <div className="detail-value">{selectedPassenger.name}</div>

              <div className="detail-label">Phone Number:</div>
              <div className="detail-value">
                {selectedPassenger.phoneNumber}
              </div>

              <div className="detail-label">Route:</div>
              <div className="detail-value">{selectedSeat.route}</div>

              <div className="detail-label">Reserved Time:</div>
              <div className="detail-value">
                {calculateTimeDifference(selectedSeat.bookedTime)}
              </div>
            </div>
            <button
              className="cancel-booking-btn"
              onClick={() => {
                const index = passengers.findIndex(
                  (p) => p._id === selectedPassenger._id
                );
                handleCancelBooking(
                  selectedBusId,
                  selectedPassenger._id,
                  selectedSeat._id,
                  index
                );
              }}
            >
              Cancel Booking
            </button>
          </div>
        </div>
      )}

      {isLoading && <LoadingScreen />}

      {alertFlag && (
        <Overlay
          alertFlag={alertFlag}
          alertMessage={alertMessage}
          setAlertFlag={setAlertFlag}
        />
      )}
    </div>
  );
};

export default BusList;
