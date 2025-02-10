import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import "./SeatSelection.css";
import axios from "axios";
import authen from "../../authent";
import Overlay from "../overlayScreen/overlay";
import Pusher from "pusher-js"; // Import Pusher

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const SeatSelection = () => {
  const navigate = useNavigate();
  const { busId } = useParams();
  const [userId, setUserId] = useState("");
  const [busDetails, setBusDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [confirmation, setConfirmation] = useState(false);
  const [alertFlag, setAlertFlag] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  authen();

  // Fetch bus details and subscribe to Pusher updates
  useEffect(() => {
    const fetchBusDetails = async () => {
      try {
        const req_user = await axios.get(`${backEndUrl}/auth`, {
          withCredentials: true,
        });
        const response = await axios.get(`${backEndUrl}/seatselection/${busId}`);
        setBusDetails(response.data);
        setUserId(req_user.data.userId);
      } catch (err) {
        console.error("Error fetching bus details:", err);
        setError("Failed to fetch bus details.");
      } finally {
        setLoading(false);
      }
    };

    if (busId) fetchBusDetails();

    // Initialize Pusher
    const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER,
    });

    const channel = pusher.subscribe("bus-channel");

    channel.bind("seat-booked", (data) => {
      if (data.busId === busId) {
        setBusDetails((prev) => {
          const updatedBus = { ...prev };
          data.selectedSeats.forEach((seat) => {
            updatedBus.seats.bookedSeats[seat] = data.userId;
          });
          return updatedBus;
        });
        setAlertMessage(`Seats ${data.selectedSeats.join(", ")} booked.`);
        setAlertFlag(true);
        setTimeout(() => setAlertFlag(false), 2000);
      }
    });

    channel.bind("seat-canceled", (data) => {
      if (data.busId === busId) {
        setBusDetails((prev) => {
          const updatedBus = { ...prev };
          data.canceledSeats.forEach((seat) => {
            updatedBus.seats.bookedSeats[seat] = "0";
          });
          return updatedBus;
        });
        setAlertMessage(`Seats ${data.canceledSeats.join(", ")} canceled.`);
        setAlertFlag(true);
        setTimeout(() => setAlertFlag(false), 2000);
      }
    });

    return () => {
      pusher.unsubscribe("bus-channel");
    };
  }, [busId]);

  const handleSeatSelect = async (seat, index) => {
    try {
      const req_user = await axios.get(`${backEndUrl}/auth`, {
        withCredentials: true,
      });
      const userId = req_user.data.userId;
      if (!userId) {
        alert("Session ended");
        navigate("/login");
        return;
      }
      const isBooked = seat !== "0";
      const isCurrentUserSeat = seat === userId;

      setSelectedSeats((prev) => {
        const newSeats = [...prev];
        if (!isBooked && !isCurrentUserSeat) {
          if (newSeats.includes(index)) {
            newSeats.splice(newSeats.indexOf(index), 1);
          } else {
            newSeats.push(index);
          }
        } else if (isCurrentUserSeat) {
          if (newSeats.includes(index)) {
            newSeats.splice(newSeats.indexOf(index), 1);
          } else {
            newSeats.push(index);
          }
        }
        setConfirmation(true);
        return newSeats;
      });
    } catch (err) {
      console.error("Error selecting seat:", err);
    }
  };

  const handleConfirmSeats = async (type) => {
    if (selectedSeats.length > 0 && type === "book") {
      setAlertMessage("Successfully selected seats");
      setAlertFlag(true);
      setTimeout(() => {
        setAlertFlag(false);
        navigate(`/payment/${selectedSeats}`);
      }, 2000);
    } else if (selectedSeats.length > 0 && type === "cancel") {
      const response = await axios.delete(
        `${backEndUrl}/seatselection/${busId}`,
        { data: { selectedSeats, userId }, withCredentials: true }
      );
      setBusDetails(response.data.updatedBus);
      setSelectedSeats([]);
      setAlertMessage("Seats canceled successfully");
      setAlertFlag(true);
      setTimeout(() => {
        setAlertFlag(false);
      }, 2000);
    } else {
      setAlertMessage("Select at least one seat");
      setAlertFlag(true);
      setTimeout(() => {
        setAlertFlag(false);
      }, 2000);
    }
  };

  if (loading) return <p>Loading bus details...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="seat-selection-page">
      <header className="header">
        <h1>Seat Selection</h1>
      </header>
      <div className="bus-card">
        <div className="bus-details">
          <h2>Bus details</h2>
          <div className="bus-data">
            <p><strong>Time</strong> {busDetails.time.departureTime}</p>
            <p><strong>Price</strong> {busDetails.price}</p>
            <p><strong>Pickup</strong> {busDetails.location.pickupLocation}</p>
            <p><strong>Arrival</strong> {busDetails.location.arrivalLocation}</p>
            <p><strong>Date</strong> {busDetails.schedule}</p>
          </div>
          <CSSTransition in={confirmation && selectedSeats.length > 0} timeout={300} classNames="confirm-btn-transition" unmountOnExit>
            <div className="seat-confirmation">
              <h3>Seats Confirmed</h3>
              <p>{selectedSeats.map((seat) => seat + 1).join(", ")}</p>
            </div>
          </CSSTransition>
        </div>
        <div className="bus-seats">
          <div className="seat-grid">
            {busDetails.seats.bookedSeats.map((seat, index) => {
              const isBooked = seat !== "0";
              const isCurrentUserBookedSeat = seat === userId;
              const isSelected = selectedSeats.includes(index);
              return (
                <div
                  key={index}
                  className={`seat ${isSelected ? "selected" : ""} ${isBooked && !isCurrentUserBookedSeat ? "booked" : ""} ${isCurrentUserBookedSeat ? "current-user" : ""}`}
                  onClick={() => (!isBooked || isCurrentUserBookedSeat || isSelected) && handleSeatSelect(seat, index)}
                  title={isBooked ? "Can't select this seat" : ""}
                >
                  {index + 1}
                </div>
              );
            })}
          </div>
          <CSSTransition in={selectedSeats.length > 0 && selectedSeats.every(seat => busDetails.seats.bookedSeats[seat] === "0")} timeout={300} classNames="confirm-btn-transition" unmountOnExit>
            <button className="confirm-btn" onClick={() => handleConfirmSeats("book")}>Proceed to payment</button>
          </CSSTransition>
          <CSSTransition in={selectedSeats.length > 0 && selectedSeats.every(seat => busDetails.seats.bookedSeats[seat] === userId)} timeout={300} classNames="confirm-btn-transition" unmountOnExit>
            <button className="confirm-btn" onClick={() => handleConfirmSeats("cancel")}>Cancel Booking</button>
          </CSSTransition>
        </div>
      </div>
      <Overlay alertFlag={alertFlag} alertMessage={alertMessage} setAlertFlag={setAlertFlag} />
    </div>
  );
};

export default SeatSelection;
