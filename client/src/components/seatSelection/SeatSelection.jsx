import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import "./SeatSelection.css";
import axios from "axios";
import Overlay from "../overlayScreen/overlay";
import LoadingPage from "../loadingPage/loadingPage";
import LoadingScreen from "../loadingScreen/loadingScreen";
// import Pusher from "pusher-js"; // Import Pusher
import SeatLegend from "./SeatLegend";
import InlineAuth from "../../InlineAuth";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const SeatSelection = () => {
  const navigate = useNavigate();
  const { busId } = useParams();
  const [userId, setUserId] = useState("");
  const [busDetails, setBusDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [reservedSeats, setReservedSeats] = useState([]);
  const [confirmation, setConfirmation] = useState(false);
  const [alertFlag, setAlertFlag] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const { isAuthenticated, isAuthorized } = InlineAuth();
  const [userGender, setUserGender] = useState(null);

  // Fetch bus details and subscribe to Pusher updates
  useEffect(() => {
    const fetchBusDetails = async () => {
      try {
        const [req_user, response] = await Promise.all([
          axios.get(`${backEndUrl}/auth`, { withCredentials: true }),
          axios.get(`${backEndUrl}/seatselection/${busId}`),
        ]);
        setBusDetails(response.data);
        setUserId(req_user.data.userId);
        setUserGender(req_user.data.gender); // Fetch gender here
      } catch (err) {
        console.error("Error fetching bus details:", err);
        setError("Failed to fetch bus details.");
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      }
    };

    if (busId) fetchBusDetails();

    // Initialize Pusher
    const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER,
    });

    const channel = pusher.subscribe("bus-channel");

    channel.bind("seat-reserved", (data) => {
      setBusDetails((prev) => ({
        ...prev,
        seats: {
          ...prev.seats,
          reservedSeats: data.updatedBus.seats.reservedSeats,
        },
      }));
    });

    channel.bind("seat-booked", (data) => {
      if (data.busId === busId) {
        setBusDetails((prev) => ({
          ...prev,
          seats: {
            ...prev.seats,
            genders: data.genders,
            bookedSeats: prev.seats.bookedSeats.map((seat, index) =>
              data.selectedSeats.includes(index) ? data.userId : seat
            ),
          },
        }));
      }
    });

    channel.bind("seat-canceled", (data) => {
      setBusDetails((prev) => ({
        ...prev,
        seats: {
          ...prev.seats,
          bookedSeats: data.updatedBus.seats.bookedSeats,
          reservedSeats: data.updatedBus.seats.reservedSeats,
          genders: data.updatedBus.seats.genders,
        },
      }));
    });
    // channel.bind("bus-deleted", (data) => {
    //   if (data.busId === busId) {
    //     localStorage.removeItem(`selectedSeats_${busId}`);
    //     setSelectedSeats([]);
    //   }
    // });
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, []);

  // useEffect(() => {
  //   const savedSeats = localStorage.getItem(`selectedSeats_${busId}`);
  //   if (savedSeats) {
  //     setSelectedSeats(JSON.parse(savedSeats));
  //   }
  // }, [busId]);

  const handleSeatSelect = async (seat, index) => {
    // setReservedSeats(
    //   busDetails.seats.reservedSeats
    //     .filter((seat) => seat.reservedBy === userId)
    //     .map((seat) => parseInt(seat.seatNumber))
    // );
    const isBooked = seat !== "0";
    const isCurrentUserSeat = seat === userId;

    const isReserved = busDetails.seats.reservedSeats
      .map((seat) => seat.seatNumber)
      .includes(String(index));

    const isReservedForCurrentUser = busDetails.seats.reservedSeats
      .filter((seat) => seat.reservedBy === userId)
      .map((seat) => seat.seatNumber)
      .includes(String(index));

    try {
      // const req_user = await axios.get(`${backEndUrl}/auth`, {
      //   withCredentials: true,
      // });

      // if (!req_user.data.userId) {
      //   alert("Session ended");
      //   navigate("/login");
      //   return;
      // }
      // const { userId, userRole } = req_user.data;

      // Update selected seats logic here
      setSelectedSeats((prev) => {
        const newSeats = [...prev];
        // **Admin Bypass: Can select/cancel any seat**
        if (isAuthorized) {
          if (newSeats.includes(index)) {
            newSeats.splice(newSeats.indexOf(index), 1); // Admin deselects
          } else {
            newSeats.push(index); // Admin selects
          }
          return newSeats;
        }

        if (newSeats.length >= 2 && !newSeats.includes(index)) {
          // alert("You can only select a maximum of 2 seats.");
          setAlertMessage("You can only select a maximum of 2 seats.");
          setAlertFlag(true);
          return prev;
        }

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
        } else {
          setConfirmation(true);
        }

        // localStorage.setItem(`selectedSeats_${busId}`, JSON.stringify(newSeats));

        return newSeats;
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleConfirmSeats = async (type) => {
    setIsLoading(true);
    console.log(busDetails.busNumber)


    if (selectedSeats.length > 0 && type === "book") {
      try {
        const response = await axios.post(
          `${backEndUrl}/seatselection/reserve/${busId}`,
          { data: { selectedSeats, userId }, withCredentials: true }
        );

        if (response.status === 200 || response.status === 202) {
          setTimeout(() => {
            setIsLoading(false);
            setAlertMessage(`${response.data.message}`);
            setAlertFlag(true);
          }, 1000);

          setTimeout(() => {
            setAlertFlag(false);
            navigate(`/payment/${selectedSeats}`);
          }, 2200);
        }
      } catch (error) {
        if (error.response && error.response.status === 400) {
          setSelectedSeats([]);

          setTimeout(() => {
            setIsLoading(false);
            setAlertMessage(
              <div className="payment-success-container">
                <h1>Reserving Failed</h1>
                <p>{error.response.data.message}</p>
              </div>
            );
            setAlertFlag(true);
          }, 1000);
        } else {
          console.error("An error occurred:", error);
        }
      }
    } else if (selectedSeats.length > 0 && type === "cancel") {
      // Check if user is an admin
      if (isAuthorized) {
        const confirmDelete = window.confirm(
          "Are you sure you want to delete these booked seats?"
        );
        if (!confirmDelete) {
          setIsLoading(false);
          return;
        }
      }
      const response = await axios.delete(
        `${backEndUrl}/seatselection/${busId}`,
        { data: { selectedSeats, userId }, withCredentials: true }
      );

      setBusDetails(response.data.updatedBus);
      setSelectedSeats([]);

      setTimeout(() => {
        setIsLoading(false);
        setAlertMessage("Seats canceled successfully");
        setAlertFlag(true);
      }, 1000);

      setTimeout(() => {
        setAlertFlag(false);
      }, 2200);
    } else {
      setTimeout(() => {
        setIsLoading(false);
        setAlertMessage("Select at least one seat");
        setAlertFlag(true);
      }, 1000);
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
  const convertTo24HourFormat = (time) => {
    const match = time.match(/(\d+):(\d+) (AM|PM)/);
    if (!match) return "";

    let [, hour, minute, period] = match;
    hour = parseInt(hour, 10);

    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;

    return `${hour.toString().padStart(2, "0")}:${minute}`;
  };

  if (loading) return <LoadingPage />;
  if (error) return <p>{error}</p>;

  return (
    <div className="seat-selection-page">
      <header className="header">
          <p className="bus-number"> {busDetails.busNumber}</p>
        <h1></h1>
      </header>
      <div className="bus-card">
        <div className="bus-details">
          <div className="bus-data">
            <p>
              <strong>Time</strong>{" "}
              {convertTo12HourFormat(busDetails.time.departureTime)}
            </p>
            <p>
              <strong>Price</strong> {busDetails.price}
            </p>
            <p>
              <strong>Pickup</strong> {busDetails.location.pickupLocation}
            </p>
            <p>
              <strong>Arrival</strong> {busDetails.location.arrivalLocation}
            </p>
            <p>
              <strong>Date</strong> {busDetails.schedule}
            </p>
          </div>
          <CSSTransition
            in={confirmation && selectedSeats.length > 0}
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
          <SeatLegend />
          <div className="seat-grid">
            {busDetails.seats.bookedSeats.map((seat, index) => {
              const isBooked = seat !== "0"; // Seat is booked if not "0"
              const isCurrentUserBookedSeat = seat === userId; // Current user booked this seat
              const isSelected = selectedSeats.includes(index); // Seat is selected
              const isReserved = busDetails.seats.reservedSeats
                .map((s) => s.seatNumber)
                .includes(String(index)); // Seat is reserved
              const isReservedForCurrentUser =
                busDetails.seats.reservedSeats.some(
                  (s) =>
                    s.seatNumber === String(index) && s.reservedBy === userId
                ); // Reserved by current user

              // Get the gender of the user who booked the seat (if available)
              const bookedGender = busDetails.seats.genders
                ? busDetails.seats.genders[index]
                : null;

              // Determine class name based on seat state
              const seatClass = `
    seat 
    ${[1, 2, 8, 11, 15].includes(index + 1) ? "hidden-seat" : ""} 
    ${isSelected ? "selected" : ""} 
    ${isReservedForCurrentUser ? "reserved-for-user" : ""}
    ${isReserved && !isReservedForCurrentUser ? "reserved" : ""}
    ${isBooked && isCurrentUserBookedSeat ? "current-user" : ""}
    ${
      isBooked && !isCurrentUserBookedSeat && bookedGender === "Male"
        ? "male-seat"
        : ""
    }
    ${
      isBooked && !isCurrentUserBookedSeat && bookedGender === "Female"
        ? "female-seat"
        : ""
    }
  `.trim();

              return (
                <div
                  key={index}
                  className={seatClass}
                  onClick={() =>
                    (!isReserved || isReservedForCurrentUser || isAuthorized) &&
                    handleSeatSelect(seat, index)
                  }
                  title={
                    isBooked && !isCurrentUserBookedSeat
                      ? `This seat is booked (${bookedGender || "Unknown"})`
                      : isReserved
                      ? "This seat is reserved temporarily"
                      : ""
                  }
                >
                  {index < 7
                    ? index - 1
                    : index > 7 && index < 10
                    ? index - 2
                    : index > 10 && index < 14
                    ? index - 3
                    : index - 4}
                </div>
              );
            })}
          </div>

          <div className="btn-container">
            <CSSTransition
              in={
                (selectedSeats.length > 0 &&
                  (selectedSeats.every(
                    (seat) => busDetails.seats.bookedSeats[seat] === userId
                  ) ||
                    selectedSeats.every((seat) =>
                      busDetails.seats.reservedSeats
                        .filter((seat) => seat.reservedBy === userId)
                        .map((seat) => seat.seatNumber)
                        .includes(String(seat))
                    ))) ||
                isAuthorized
              }
              timeout={300}
              classNames="confirm-btn-transition"
              unmountOnExit
            >
              <button
                className="confirm-btn"
                onClick={() => handleConfirmSeats("cancel")}
              >
                Cancel
              </button>
            </CSSTransition>

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
                Proceed
              </button>
            </CSSTransition>
          </div>
        </div>
      </div>

      {isLoading && <LoadingScreen />}

      <Overlay
        alertFlag={alertFlag}
        alertMessage={alertMessage}
        setAlertFlag={setAlertFlag}
      />
    </div>
  );
};

export default SeatSelection;
