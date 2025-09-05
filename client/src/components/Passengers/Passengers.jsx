import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingComponent from "../loadingComponent/loadingComponent";
import LoadingScreen from "../loadingScreen/loadingScreen";
import LoadingPage from "../loadingPage/loadingPage";
import Overlay from "../overlayScreen/overlay";
import "./Passengers.css";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const PassengersPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { busId } = location.state || {};
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [alertFlag, setAlertFlag] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [seats, setSeats] = useState([]);
  const [userInfo, setUserInfo] = useState({});
  const [seatId, setSeatId] = useState("");
  const [showCancelOverlay, setShowCancelOverlay] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [availableBuses, setAvailableBuses] = useState([]);
  const [selectedNewBus, setSelectedNewBus] = useState(null);
  const [destination, setDestination] = useState("");
  const [availableDestinations, setAvailableDestinations] = useState([]);
  
  // New state for bus details
  const [busDetails, setBusDetails] = useState(null);
  const [busDetailsLoading, setBusDetailsLoading] = useState(true);
  const [busDetailsError, setBusDetailsError] = useState(null);

  const fetchBusDetails = async () => {
    try {
      setBusDetailsLoading(true);
      const response = await axios.get(`${backEndUrl}/form/${busId}`);
      setBusDetails(response.data);
      setBusDetailsError(null);
    } catch (error) {
      console.error("Error fetching bus details:", error);
      setBusDetailsError("Failed to load bus details");
    } finally {
      setBusDetailsLoading(false);
    }
  };

  const fetchReservedPassengers = async () => {
    try {
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
      
      setPageLoading(false);
    } catch (error) {
      console.error("Error fetching reserved passengers:", error);
      setSeats([]);
      setPageLoading(false);
    }
  };

  const handleSeatCancel = async () => {
    setIsLoading(true);
    try {
      const cancelResponse = await axios.delete(
        `${backEndUrl}/formselection/${busId}`,
        {
          data: { seatId: seatId, userId: currentUser },
        }
      );

      if (cancelResponse.status === 200) {
        setSeats(seats.filter((seat) => seat.seatId !== seatId));
        setShowCancelOverlay(false);
        setSeatId("");

        setIsLoading(false);
        setAlertMessage("✅ Seat canceled successfully!");
        setAlertFlag(true);

        setTimeout(() => {
          setAlertFlag(false);
        }, 2200);
      }
    } catch (error) {
      console.error("Error cancelling the seat", error);
      setShowCancelOverlay(false);
      setIsLoading(false);
      setAlertMessage("⚠️ You can only cancel your seats before the bus time by 3 hours!");
      setAlertFlag(true);

      setTimeout(() => {
        setAlertFlag(false);
      }, 2200);
    }
  };

  const handleSwitchClick = async (seatIdToSwitch) => {
    setIsLoading(true);
    try {
      // First get the current bus details to know the route
      const currentBusResponse = await axios.get(`${backEndUrl}/form/${busId}`);
      const currentBus = currentBusResponse.data;
      console.log("Current bus:", currentBus);

      // Then get all available buses
      const allBusesResponse = await axios.get(`${backEndUrl}/form`);
      console.log("All buses:", allBusesResponse.data);

      // Filter buses with the same route and future dates
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day for date comparison

      const filteredBuses = allBusesResponse.data.filter(bus => {
        const busDate = new Date(bus.schedule);
        busDate.setHours(0, 0, 0, 0); // Set to start of day for date comparison
        
        const isValidBus = bus._id !== busId && 
          bus.location.pickupLocation === currentBus.location.pickupLocation &&
          bus.location.arrivalLocation === currentBus.location.arrivalLocation &&
          busDate >= today;

        console.log("Bus being checked:", {
          id: bus._id,
          schedule: bus.schedule,
          pickup: bus.location.pickupLocation,
          arrival: bus.location.arrivalLocation,
          isValid: isValidBus,
          currentPickup: currentBus.location.pickupLocation,
          currentArrival: currentBus.location.arrivalLocation
        });

        return isValidBus;
      });
      
      console.log("Filtered buses:", filteredBuses);
      
      setAvailableBuses(filteredBuses);
      setSeatId(seatIdToSwitch);
      setShowSwitchModal(true);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching available buses:", error);
      setIsLoading(false);
      setAlertMessage("⚠️ Error fetching available buses!");
      setAlertFlag(true);
      setTimeout(() => setAlertFlag(false), 2200);
    }
  };

  const handleBusSelect = (bus) => {
    setSelectedNewBus(bus);
    if (bus.location.pickupLocation === "E-JUST" && bus.location.arrivalLocation === "Cairo") {
      setAvailableDestinations(["Ramses", "Dandy"]);
    } else if (bus.location.pickupLocation === "Cairo" && bus.location.arrivalLocation === "E-JUST") {
      setAvailableDestinations(["Abaseya", "Dandy"]);
    }
  };

  const handleSwitchConfirm = async () => {
    if (!selectedNewBus || !destination) {
      setAlertMessage("⚠️ Please select a bus and destination!");
      setAlertFlag(true);
      setTimeout(() => setAlertFlag(false), 2200);
      return;
    }

    setIsLoading(true);
    try {
      // Cancel current booking
      await axios.delete(`${backEndUrl}/formselection/${busId}`, {
        data: { seatId: seatId, userId: currentUser },
      });

      // Create new booking
      await axios.post(
        `${backEndUrl}/formselection/${selectedNewBus._id}`,
        { userId: currentUser, destination },
        { withCredentials: true }
      );

      setShowSwitchModal(false);
      setSelectedNewBus(null);
      setDestination("");
      setIsLoading(false);
      setAlertMessage("✅ Trip switched successfully! Redirecting to new trip List...");
      setAlertFlag(true);
      
      // Redirect to the new trip's passenger list after a short delay
      setTimeout(() => {
        setAlertFlag(false);
        navigate("/passengers", { 
          state: { 
            busId: selectedNewBus._id, 
            userId: currentUser,
            fromSwitch: true 
          } 
        });
      }, 2200);
    } catch (error) {
      console.error("Error switching trip:", error);
      setIsLoading(false);
      setAlertMessage("⚠️ Error switching trip. Please try again!");
      setAlertFlag(true);
      setTimeout(() => setAlertFlag(false), 2200);
    }
  };

  const handleSeatSelection = (seatIdSelected) => {
    setSeatId(seatIdSelected);
    setShowCancelOverlay(true);
  };

  const getRowColor = (index) => {
    const fullGroups = Math.floor(seats.length / 15);
    const lastGreenIndex = fullGroups * 15 - 1;
    return index <= lastGreenIndex ? "green" : "red";
  };

  const convertTo12HourFormat = (time) => {
    if (!time || !time.includes(":")) return "";
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

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderBusDetailsCard = () => {
    if (busDetailsLoading) {
      return (
        <div className="bus-details-card">
          <div className="bus-details-loading">
            Loading bus details...
          </div>
        </div>
      );
    }

    if (busDetailsError) {
      return (
        <div className="bus-details-card">
          <div className="bus-details-error">
            {busDetailsError}
          </div>
        </div>
      );
    }

    if (!busDetails) return null;

    return (
      <article className="bus-details-card">
        <div className="bus-details-content">
          <time className="bus-schedule-time">
            {formatDate(busDetails.schedule)}
          </time>
          <div className="bus-route-title">
            {busDetails.location?.pickupLocation} → {busDetails.location?.arrivalLocation}
          </div>
          <div className="bus-details-tags">
        
            <span className="bus-tag time">
              {convertTo12HourFormat(busDetails.departureTime)}
            </span>
         
          </div>
        </div>
      </article>
    );
  };

  useEffect(() => {
    if (busId) {
      fetchBusDetails();
      fetchReservedPassengers();
    }
  }, [busId]);

  useEffect(() => {
    // Show welcome message when redirected from switch
    if (location.state?.fromSwitch) {
      setAlertMessage("👋 Welcome to your new trip details!");
      setAlertFlag(true);
      setTimeout(() => setAlertFlag(false), 2200);
    }
  }, []);

  if (pageLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="passengers-page">
      <h2 className="title">Reserved Passengers</h2>
      
      {/* Bus Details Card */}
      {renderBusDetailsCard()}

      {seats.length > 0 ? (
        <div className="table-container" style={{ overflowX: "auto" }}>
          <table className="passenger-table">
            <colgroup>
              <col style={{ width: "10%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "20%" }} />
            </colgroup>

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
                          <div className="action-buttons">
                            <button
                              className="cancel-button"
                              onClick={() => handleSeatSelection(seat.seatId)}
                            >
                              Cancel
                            </button>
                            <button
                              className="switch-button"
                              onClick={() => handleSwitchClick(seat.seatId)}
                            >
                              Switch Trip
                            </button>
                          </div>
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
      ) : isLoading ? (
        <LoadingComponent />
      ) : (
        <p className="no-data">No reserved passengers found.</p>
      )}

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

      {showSwitchModal && (
        <div className="modal-overlay">
          <div className="modal switch-modal">
            <button
              className="close-button"
              onClick={() => {
                setShowSwitchModal(false);
                setSelectedNewBus(null);
                setDestination("");
              }}
            >
              ×
            </button>
            <h3>Switch Trip</h3>
            <div className="available-buses">
              <h4>Select New Bus</h4>
              {availableBuses.length > 0 ? (
                <div className="bus-options">
                  {availableBuses.map((bus) => (
                    <div
                      key={bus._id}
                      className={`bus-option ${selectedNewBus?._id === bus._id ? 'selected' : ''}`}
                      onClick={() => handleBusSelect(bus)}
                    >
                      <p>Date: {bus.schedule}</p>
                      <p>Time: {convertTo12HourFormat(bus.departureTime)}</p>
                      <p>From: {bus.location.pickupLocation}</p>
                      <p>To: {bus.location.arrivalLocation}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-buses">No available buses for switching.</p>
              )}

              {selectedNewBus && (
                <div className="destination-selection">
                  <h4>Select Destination</h4>
                  <div className="destination-options">
                    {availableDestinations.map((dest) => (
                      <button
                        key={dest}
                        className={`destination-btn ${destination === dest ? 'selected' : ''}`}
                        onClick={() => setDestination(dest)}
                      >
                        {dest}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedNewBus && destination && (
                <button
                  className="confirm-switch"
                  onClick={handleSwitchConfirm}
                >
                  Confirm
                </button>
              )}
            </div>
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

export default PassengersPage;