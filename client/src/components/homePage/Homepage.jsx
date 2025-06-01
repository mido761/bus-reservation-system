import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Homepage.css";
import Footer from "../footer/footer";
import Navbar from "../navbar/nav";
import LoadingPage from "../loadingPage/loadingPage";
import LoadingComponent from "../loadingComponent/loadingComponent";
import LoadingScreen from "../loadingScreen/loadingScreen";
import Overlay from "../overlayScreen/overlay";
const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const Homepage = () => {
  const navigate = useNavigate();
  const [pickupPoint, setPickupPoint] = useState("");
  const [arrivalPoint, setArrivalPoint] = useState("");
  const [date, setDate] = useState("");
  const [buses, setBuses] = useState([]);
  const [userId, setUserId] = useState("");
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [alertFlag, setAlertFlag] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showBusOptions, setShowBusOptions] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const [showBookingConfirm, setShowBookingConfirm] = useState(false);
  const [showPassengerList, setShowPassengerList] = useState(false);
  const [passengerList, setPassengerList] = useState([]);
  const [destination, setDestination] = useState("");
  const [reservedPassengers, setReservedPassengers] = useState([]);
  const [showReservedPassengerList, setShowReservedPassengerList] =
    useState(false);


  // Format today's date to set as min date
  const getTodayFormatted = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchBuses = async () => {
    try {
      const [req_user, response] = await Promise.all([
        axios.get(`${backEndUrl}/auth`, { withCredentials: true }),
      ]);
      const res = await axios.get(`${backEndUrl}/buses`);
      setBuses(res.data);
      // setFilteredBuses(res.data);
      setUserId(req_user.data.userId);
    } catch (error) {
      console.error("Error fetching buses:", error);
    } finally {
      setTimeout(() => setIsLoading(false), 1500);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchBuses();
  }, []);

  const popularRoutes = [
    { id: 1, route: "Cairo to E-JUST" },
    { id: 3, route: "E-JUST to Cairo" },
  ];

  const handleBusSelect = (bus) => {
    setSelectedBus(bus);
    setShowBusOptions(true);
  };

  const handleSearch = () => {
    if (!Array.isArray(buses)) {
      console.error("buses is not an array:", buses);
      return;
    }

    const filtered = buses.filter(
      (bus) =>
        bus.location.pickupLocation === pickupPoint &&
        bus.location.arrivalLocation === arrivalPoint &&
        bus.schedule === date
    );
    setFilteredBuses(filtered);
  };

  const handleRouteSelect = (route) => {
    const [pickup, arrival] = route.split(" to ");
    setPickupPoint(pickup);
    setArrivalPoint(arrival);
    setTimeout(handleSearch, 0);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    const contactData = { name, email, message };
    try {
      await axios.post(`${backEndUrl}/contact`, contactData);
      setResponseMessage("Message sent successfully");
    } catch (error) {
      setResponseMessage("Failed to send message");
      console.error("Error sending contact message:", error);
    }
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
  const handleSeeReservedPassengers = async (bus) => {
    try {
      setSelectedBus(bus);
      // Fetch the reserved passengers for the selected bus
      const response = await axios.get(`/formselection/${bus._id}`);

      // Extract passengers from the response
      let data = response.data;

      // Safely extract an array from any possible shape
      // if (Array.isArray(data)) {
      setPassengerList(data); // case: direct array
      // } else if (Array.isArray(data.passengers)) {
      //   setPassengerList(data.passengers); // case: { passengers: [...] }
      // } else {
      //   console.error("Unexpected response format");
      //   setPassengerList([]); // fallback to empty list
      // }

      // Navigate to the /passengers page with the busId and userId
      navigate("/passengers", { state: { busId: bus._id, userId } });
      setShowBusOptions(false);
    } catch (error) {
      console.error("Error fetching reserved passengers:", error);
      setPassengerList([]); // Fallback to empty list
    }
  };

  const handleBookSeatConfirm = async () => {
    setLoading(true);
    try {
      await axios.post(
        `${backEndUrl}/formselection/${selectedBus._id}`,
        { userId, destination },
        { withCredentials: true }
      );
      setShowBusOptions(false);
      setLoading(false);
      setAlertMessage("✅ Seat booked successfully! Now redirecting to passenger list...");
      setAlertFlag(true);

      // Using the same timeout for both alert hiding and navigation (2200ms)
      const redirectTimeout = 2200;

      setTimeout(() => {
        setAlertFlag(false);
        // Navigate to passengers page with the busId
        navigate("/passengers", {
          state: {
            busId: selectedBus._id,
            userId,
            fromBooking: true
          }
        });
      }, redirectTimeout);
    } catch (err) {
      console.error("Booking failed:", err);
      setLoading(false);
      setAlertMessage("⚠️ You can only book 2 seats max!");
      setAlertFlag(true);
      setTimeout(() => setAlertFlag(false), 2200);
    }
  };

  return (
    <div className="home-page">
      <div className="search-container">
        <div className="bus-search-bar">
          <select
            onChange={(e) => setPickupPoint(e.target.value)}
            value={pickupPoint}
          >
            <option value="">Pickup Point</option>
            <option value="E-JUST">E-JUST</option>
            <option value="Cairo">Cairo</option>
          </select>
          <select
            onChange={(e) => setArrivalPoint(e.target.value)}
            value={arrivalPoint}
          >
            <option value="">Arrival Point</option>
            <option value="Cairo">Cairo</option>
            <option value="E-JUST">E-JUST</option>
          </select>

          <div className="date-input-container">
            <input
              type="date"
              onChange={(e) => setDate(e.target.value)}
              value={date}
              min={getTodayFormatted()}
              className={!date ? "date-empty" : ""}
            />
            {!date && <div className="date-placeholder">Select Travel Date</div>}
          </div>

          <button className="search-btn" onClick={handleSearch}>
            Search
          </button>
          <div className="popular-routes">
            <h3>Popular Routes</h3>
            <div className="popular-routes-list">
              {popularRoutes.map((route) => (
                <div
                  key={route.id}
                  className="route-card"
                  onClick={() => handleRouteSelect(route.route)}
                >
                  {route.route}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <LoadingComponent />
      ) : (
        <>
          <h2>Available Buses</h2>
          <div className="bus-list">
            {filteredBuses.length ? (
              filteredBuses.map((bus, index) => (
                <div
                  key={bus._id}
                  className={`bus-container ${filteredBuses.length > 1 && index === 0 ? "top-margin" : ""
                    }`}
                >
                  <button
                    className="list-btn top-right-btn"
                    onClick={() => {
                      handleSeeReservedPassengers(bus);
                    }}
                  >
                    <img src="arrow.png" alt="Delete" />
                  </button>
                  <div className="list-body">
                    <p>{bus.location.arrivalLocation}</p>
                    <p>{bus.schedule}</p>
                    <p>Time: {convertTo12HourFormat(bus.departureTime)}</p>
                  </div>
                  <button onClick={() => handleBusSelect(bus)}>
                    Book a seat
                  </button>
                </div>
              ))
            ) : (
              <p>No buses found matching your criteria.</p>
            )}
          </div>
        </>
      )}

      {/* Option Modal */}
      {showBusOptions && selectedBus && (
        <div className="modal-overlay">
          <div className="modal">
            <button
              className="close-button"
              onClick={() => setShowBusOptions(false)}
            >
              x{/* <img src="cancel.png" alt="Delete" /> */}
            </button>
            <h3>Select destination</h3>
            <div className="destination-selector">
              <div className="button-group">
                <button
                  className={`destination-btn ${destination === "Dandy" ? "selected" : ""
                    }`}
                  onClick={() => setDestination("Dandy")}
                >
                  Dandy
                </button>
                <button
                  className={`destination-btn ${destination === "Ramses" ? "selected" : ""
                    }`}
                  onClick={() => setDestination("Ramses")}
                >
                  Ramses
                </button>
              </div>
            </div>

            {destination ? (
              <button className="cofirm-btn" onClick={handleBookSeatConfirm}>
                Confirm
              </button>
            ) : (
              <p style={{ color: "red", marginTop: "10px" }}>
                Please select a destination
              </p>
            )}
          </div>
        </div>
      )}

      {/* Booking Confirmation Modal */}
      {/* {showBookingConfirm && selectedBus && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Booking</h3>
            <div className="destination-selector">
              <div className="button-group">
                <button
                  className={`destination-btn ${
                    destination === "Dandy" ? "selected" : ""
                  }`}
                  onClick={() => setDestination("Dandy")}
                >
                  Dandy
                </button>
                <button
                  className={`destination-btn ${
                    destination === "Ramses" ? "selected" : ""
                  }`}
                  onClick={() => setDestination("Ramses")}
                >
                  Ramses
                </button>
              </div>
            </div>

            {destination ? (
              <button onClick={handleBookSeatConfirm}>Confirm</button>
            ) : (
              <p style={{ color: "red", marginTop: "10px" }}>
                Please select a destination
              </p>
            )}
            <button onClick={() => setShowBookingConfirm(false)}>Cancel</button>
          </div>
        </div>
      )} */}

      {/* Reserved Passenger List Modal */}
      {showReservedPassengerList && selectedBus && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Reserved Passengers</h3>
            {reservedPassengers.length > 0 ? (
              <ul>
                {reservedPassengers.map((passenger, idx) => (
                  <li key={idx}>
                    Name: {passenger.name} | Phone: {passenger.phoneNumber} |
                    Seats: {passenger.numberOfSeats}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No reserved passengers found.</p>
            )}
            <button onClick={() => setShowReservedPassengerList(false)}>
              Close
            </button>
          </div>
        </div>
      )}
      {loading && <LoadingScreen />}
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

export default Homepage;
