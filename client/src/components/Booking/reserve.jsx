import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import formatDateTime from "./../../formatDateAndTime";
import "./reserve.css";
const backEndUrl = import.meta.env.VITE_BACK_END_URL;
const Reserve = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { trip, route } = location.state || {};
  const [stops, setStops] = useState([]);
  const [selectedStop, setSelectedStop] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [showPendingModal, setShowPendingModal] = useState({ show: false, booking: null });
  useEffect(() => {
    const fetchStops = async () => {
      try {
        const res = await axios.get(
          `${backEndUrl}/stop/get-stops-route/${route.route_id}`
        );
        console.log(res.data.stops);
        setStops(res.data.stops);
      } catch (err) {
        setStops([]);
      }
    };

    fetchStops();
  }, []);
  // Show modal for confirmation
  const handleConfiremreserve = () => {
    if (!selectedStop) {
      setBookingError("Please select a stop before confirming.");
      return;
    }
    setBookingError("");
    setShowModal(true);
  };


  const handleModalConfirm = async () => {
  setIsBooking(true);
  setBookingError("");
  try {
    const res = await axios.post(
      `${backEndUrl}/booking/book`,
      {
        tripId: trip.trip_id,
        stopId: selectedStop.stop_id,
      },
      { withCredentials: true }
    );

    const booking = res.data.booked;

    setShowModal(false);
    navigate("/payment", {
      state: { booking, trip, route },
    });

  } catch (err) {
    if (err.response && err.response.status === 400) {
      // Pending booking case
      const booking = err.response.data.booking;
      setBookingError(err.response.data.message);

      // Show special modal with two options
      setShowModal(false);
      setShowPendingModal({ show: true, booking });
    } else {
      setBookingError("Booking failed. Please try again.");
    }
  } finally {
    setIsBooking(false);
  }
};


  return (
    <div className="reserve-page">
      <h1>Reserve Your Trip</h1>
      {trip ? (
        <>
          <p>
            <strong>Route:</strong> {route.source} → {route.destination}
          </p>
          <p>
            <strong>Date:</strong> {trip.date}
          </p>
          <p>
            <strong>Departure:</strong> {formatDateTime(trip.departure_time)}
          </p>
          <p>
            <strong>Arrival:</strong> {formatDateTime(trip.arrival_time)}
          </p>
          <div>
            <p>
              <strong>Select a stop:</strong>
            </p>
            <div className="stops-list">
              {stops.map((stop) => (
                <button
                  key={stop.stop_id}
                  onClick={() => setSelectedStop(stop)}
                  className={`stop-btn${
                    selectedStop?.stop_id === stop.stop_id ? " selected" : ""
                  }`}
                  tabIndex={0}
                >
                  <span className="stop-icon" role="img" aria-label="stop">🚌</span>
                  <span>
                    <span style={{fontWeight:600}}>{stop.stop_name}</span>
                    <span style={{color:'#888', fontWeight:400}}> – {stop.location}</span>
                  </span>
                </button>
              ))}
            </div>
            {selectedStop && (
              <div className="selected-stop">
                <span role="img" aria-label="selected">
                  ✅
                </span>{" "}
                You selected: <strong>{selectedStop.stop_name}</strong>
              </div>
            )}
            {bookingError && (
              <div
                style={{
                  color: "red",
                  marginTop: "1rem",
                  fontWeight: 500,
                }}
              >
                {bookingError}
              </div>
            )}
          </div>
          <button
            className="confirm-btn"
            onClick={handleConfiremreserve}
          >
            Confirm Reservation
          </button>
          {showPendingModal.show && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h2>Pending Booking Found</h2>
      <p className="pending-msg">{bookingError}</p>
      <div className="modal-btns">
        <button
          className="modal-btn confirm"
          onClick={() => {
            navigate("/payment", {
              state: {
                booking: showPendingModal.booking,
                trip,
                route,
              },
            });
          }}
        >
          Complete Reservation
        </button>
        <button
          className="modal-btn cancel"
          onClick={() => navigate("/home")}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}


          {showModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>Confirm Your Reservation</h2>
                <div className="modal-details">
                  <p>
                    <strong>Route:</strong> {route.source} → {route.destination}
                  </p>
                  <p>
                    <strong>Date:</strong> {trip.date}
                  </p>
                  <p>
                    <strong>Departure:</strong> {formatDateTime(trip.departure_time)}
                  </p>
                  <p>
                    <strong>Arrival:</strong> {formatDateTime(trip.arrival_time)}
                  </p>
                  <p>
                    <strong>Selected Stop:</strong> {selectedStop?.stop_name} –{" "}
                    {selectedStop?.location}
                  </p>
                </div>
                <div className="modal-btns">
                  <button
                    className="modal-btn confirm"
                    onClick={handleModalConfirm}
                    disabled={isBooking}
                  >
                    {isBooking ? "Processing..." : "Confirm"}
                  </button>
                  <button
                    className="modal-btn cancel"
                    onClick={() => setShowModal(false)}
                    disabled={isBooking}
                  >
                    Cancel
                  </button>
                </div>
                {bookingError && (
                  <div
                    style={{
                      color: "red",
                      marginTop: "1rem",
                      fontWeight: 500,
                    }}
                  >
                    {bookingError}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="no-trip">No trip selected.</p>
      )}
    </div>
  );
};

export default Reserve;
