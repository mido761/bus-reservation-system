import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import "./SeatSelection.css";
import axios from "axios";
import authen from "../../authent";
import Overlay from "../overlayScreen/overlay";

const port = 3001;

const SeatSelection = () => {
  const navigate = useNavigate();
  // Bus Id
  const { busId } = useParams();
  // User Id
  const [userId, setUserId] = useState("");
  // Bus details
  const [busDetails, setBusDetails] = useState(null);
  // Loading flag
  const [loading, setLoading] = useState(true);
  // Error message
  const [error, setError] = useState(null);
  // Selected seats Array
  const [selectedSeats, setSelectedSeats] = useState([]);
  // confirmation flag
  const [confirmation, setConfirmation] = useState(false);
  // overlay message and flag
  const [alertFlag, setAlertFlag] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // const [isSelected, setIsSelected] = useState(false);
  // const [isBooked, setIsBooked] = useState(false);
  // const [isCurrentUserSeat, setIsCurrentUserSeat] = useState(false);

  // Authentication function
  authen();

  useEffect(() => {
    const fetchBusDetails = async () => {
      try {
        const req_user = await axios.get(`http://localhost:${port}/auth`, {
          withCredentials: true,
        });
        console.log(req_user);
        const response = await axios.get(
          `http://localhost:${port}/seatselection/${busId}`
        );
        setBusDetails(response.data);
        setUserId(req_user.data.userId);
      } catch (err) {
        console.error("Error fetching bus details:", err);
        setError("Failed to fetch bus details.");
      } finally {
        setLoading(false);
      }
    };

    if (busId) {
      fetchBusDetails();
    }
  }, []);

  const handleSeatSelect = async (seat, index) => {
    try {
      const req_user = await axios.get(`http://localhost:${port}/auth`, {
        withCredentials: true,
      });
      const userId = req_user.data.userId; // Ensure the token contains the user ID
      if (!userId) {
        alert("Session ended");
        navigate("/login");
        return;
      }
      const isBooked = seat !== "0"; // Check if the seat is booked
      const isCurrentUserSeat = seat === userId; // Check if a seat belongs to the current user

      // setIsCurrentUserSeat(seat === userId);
      // setIsBooked(seat !== "0");
      // setIsSelected(selectedSeats.includes(index));
      // req_user.data.busId = busId
      // console.log(req_user)
      // Update the selected seats in the state
      setSelectedSeats((prev) => {
        const newSeats = [...prev];

        // Only allow selecting available seats (index !== "0")
        if (!isBooked && !isCurrentUserSeat) {
          if (newSeats.includes(index)) {
            newSeats.splice(newSeats.indexOf(index), 1); // Deselect seat if already selected
          } else {
            newSeats.push(index); // Select the seat
          }
        } else if (isCurrentUserSeat) {
          if (newSeats.includes(index)) {
            newSeats.splice(newSeats.indexOf(index), 1); // Deselect seat if already selected
          } else {
            newSeats.push(index); // Select the seat
          }
        } else {
          console.log(
            `Seat ${index + 1} is already booked and cannot be selected.`
          );
        }
        setConfirmation(true);
        return newSeats;
      });

      // Send the seat reservation request to the backend
      // const response = await axios.post(
      //   `http://localhost:${port}/seatselection/${busId}`,
      //   { seatIndex: index, userId },
      //   { withCredentials: true }
      // );

      // console.log('Seat selection successful:', response.data);
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
      // Delete selected seats
      const response = await axios.delete(
        `http://localhost:${port}/seatselection/${busId}`,
        { data: { selectedSeats, userId }, withCredentials: true }
      );
      setBusDetails(response.data.updatedBus); // update bus details after deletion
      setSelectedSeats([]); // Reset selected seats
      // Notification Message
      setAlertMessage("Seats cancelled successfully");
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

  if (loading) {
    return <p>Loading bus details...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="seat-selection-page">
      <header className="header">
        <h1>Seat Selection</h1>
      </header>

      <div className="bus-container">
        <div className="bus-details">
          <h2>Bus details</h2>
          <div className="bus-data">
            <p>
              <strong>Time</strong> {busDetails.time.departureTime}
            </p>
            <p>
              <strong>Price </strong> {busDetails.price}
            </p>
            <p>
              {" "}
              <strong>Pickup</strong>
              {busDetails.location.pickupLocation}
            </p>
            <p>
              {" "}
              <strong>Arrival</strong>
              {busDetails.location.arrivalLocation}
            </p>
            <p>
              {" "}
              <strong>Date</strong>
              {busDetails.schedule}
            </p>
          </div>

          <CSSTransition
            in={
              confirmation &&
              selectedSeats.length > 0
            }
            timeout={300}
            classNames="confirm-btn-transition"
            unmountOnExit
          >
            <div className="seat-confirmation">
              <h3>Seats Confirmed</h3>
              <p>{selectedSeats.map((seat) => seat + 1).join(", ")}</p>
            </div>
          </CSSTransition>


        </div>

        <div className="bus-seats">
          <div className="seat-grid">
            {busDetails.seats.bookedSeats.map((seat, index) => {
              const isBooked = seat !== "0"; // Check if the seat is booked
              const isCurrentUserBookedSeat = seat === userId; // Check if a seat belongs to the current user
              const isSelected = selectedSeats.includes(index);

              return (
                <div
                  key={index}
                  className={`seat ${isSelected ? "selected" : ""} ${
                    isBooked && !isCurrentUserBookedSeat ? "booked" : ""
                  } ${isCurrentUserBookedSeat ? "current-user" : ""}`}
                  onClick={() =>
                    (!isBooked || isCurrentUserBookedSeat || isSelected) &&
                    handleSeatSelect(seat, index)
                  } // Prevent selecting booked seats
                  title={isBooked ? "Can't select this seat" : ""} // Tooltip for unselectable seats
                >
                  {index + 1}
                </div>
              );
            })}
          </div>

          <CSSTransition
            in={
              selectedSeats.length > 0 &&
              selectedSeats.every(
                (seat) => busDetails.seats.bookedSeats[seat] === "0"
              )
            }
            timeout={300}
            classNames="confirm-btn-transition"
            unmountOnExit
          >
            <button
              className="confirm-btn"
              onClick={() => handleConfirmSeats("book")}
            >
              Proceed to payment
            </button>
          </CSSTransition>



          <CSSTransition
            in={
              selectedSeats.length > 0 &&
              selectedSeats.every(
                (seat) => busDetails.seats.bookedSeats[seat] === userId
              )
            }
            timeout={300}
            classNames="confirm-btn-transition"
            unmountOnExit
          >
            <button
              className="confirm-btn"
              onClick={() => handleConfirmSeats("cancel")}
            >
              Canel Booking
            </button>
          </CSSTransition>

        </div>
      </div>


      <Overlay
        alertFlag={alertFlag}
        alertMessage={alertMessage}
        setAlertFlag={setAlertFlag}
      />


    </div>
  );
};

export default SeatSelection;
