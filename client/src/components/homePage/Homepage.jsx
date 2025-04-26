import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Homepage.css";
import Footer from "../footer/footer";
import Navbar from "../navbar/nav";
import LoadingPage from "../loadingPage/loadingPage";
import LoadingComponent from "../loadingComponent/loadingComponent";
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
  const [destination, setDestination] = useState('');
  const [reservedPassengers, setReservedPassengers] = useState([]);
  const [showReservedPassengerList, setShowReservedPassengerList] = useState(false);

  const fetchBuses = async () => {
    try {
      const [req_user, response] = await Promise.all([
        axios.get(`${backEndUrl}/auth`, { withCredentials: true }),
      ]);
      const res = await axios.get(`${backEndUrl}/buses`);
      setBuses(res.data);
      setFilteredBuses(res.data);
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
    { id: 1, route: "Abaseya to E-JUST" },
    { id: 2, route: "Dandy to E-JUST" },
    { id: 3, route: "E-JUST to Ramses" },
    { id: 4, route: "E-JUST to Dandy" },
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
        (pickupPoint ? bus.location.pickupLocation === pickupPoint : true) &&
        (arrivalPoint ? bus.location.arrivalLocation === arrivalPoint : true) &&
        (date ? bus.schedule === date : true)
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
  const handleSeeReservedPassengers = async () => {
    try {
      console.log(selectedBus)
      // Fetch the reserved passengers for the selected bus
      const response = await axios.get(`/formselection/${selectedBus._id}`);
  
      // Extract passengers from the response
      let data = response.data;
  
      // Safely extract an array from any possible shape
      if (Array.isArray(data)) {
        setPassengerList(data); // case: direct array
      } else if (Array.isArray(data.passengers)) {
        setPassengerList(data.passengers); // case: { passengers: [...] }
      } else {
        console.warn("Unexpected response format", data);
        setPassengerList([]); // fallback to empty list
      }
  
      // Navigate to the /passengers page with the busId and userId
      navigate("/passengers", { state: { busId: selectedBus._id, userId } });
  
    } catch (error) {
      console.error("Error fetching reserved passengers:", error);
      setPassengerList([]); // Fallback to empty list
    }
  };
  
  
  
  const handleBookSeatConfirm = async () => {
    try { 
      console.log(destination); 
      await axios.post(`${backEndUrl}/formselection/${selectedBus._id}`, { userId ,destination}, { withCredentials: true });
      setShowBookingConfirm(false);
      alert("Seat booking confirmed!");
    } catch (err) {
      console.error("Booking failed:", err);
      alert("Failed to book seat.");
    }
  };
  
  return (
    <div className="home-page">
      <div className="search-container">
        <div className="bus-search-bar">
          <select onChange={(e) => setPickupPoint(e.target.value)} value={pickupPoint}>
            <option value="">Pickup Point</option>
            <option value="E-JUST">E-JUST</option>
            <option value="Abaseya">Abaseya</option>
            <option value="Dandy">Dandy</option>
          </select>
          <select onChange={(e) => setArrivalPoint(e.target.value)} value={arrivalPoint}>
            <option value="">Arrival Point</option>
            <option value="E-JUST">E-JUST</option>
            <option value="Ramses">Ramses</option>
            <option value="Dandy">Dandy</option>
          </select>
          <input type="date" onChange={(e) => setDate(e.target.value)} value={date} />
          <button className="search-btn" onClick={handleSearch}>Search</button>
        </div>

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
                  className={`bus-container ${filteredBuses.length > 1 && index === 0 ? "top-margin" : ""}`}
                  onClick={() => handleBusSelect(bus)}
                >
                  <button className="top-right-btn"></button>
                  <div className="list-body">
                  <p>Schedule: {bus.schedule}</p>
                  <p>Time: {convertTo12HourFormat(bus.departureTime)}</p>
                  </div>
                  <button>Book a seat</button>
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
            <h3>Choose an action</h3>
            <button
              onClick={() => {
                setShowBusOptions(false);
                setShowBookingConfirm(true);
              }}
            >
              Book a Seat
            </button>
            <button
              onClick={() => {
                handleSeeReservedPassengers();
                setShowBusOptions(false);
                setShowReservedPassengerList(true);
              }}
            >
              Reserved Passengers
            </button>
            <button onClick={() => setShowBusOptions(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Booking Confirmation Modal */}
      {showBookingConfirm && selectedBus && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Booking</h3>
            <div className="destination-selector">
              <div className="button-group">
                <button
                  className={`destination-btn ${destination === 'Dandy' ? 'selected' : ''}`}
                  onClick={() => setDestination('Dandy')}
                >
                  Dandy
                </button>
                <button
                  className={`destination-btn ${destination === 'Ramses' ? 'selected' : ''}`}
                  onClick={() => setDestination('Ramses')}
                >
                  Ramses
                </button>
              </div>
            </div>

            {destination ? (
              <button onClick={handleBookSeatConfirm}>Confirm</button>
            ) : (
              <p style={{ color: "red", marginTop: "10px" }}>Please select a destination</p>
            )}
            <button onClick={() => setShowBookingConfirm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Reserved Passenger List Modal */}
      {showReservedPassengerList && selectedBus && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Reserved Passengers</h3>
            {reservedPassengers.length > 0 ? (
              <ul>
                {reservedPassengers.map((passenger, idx) => (
                  <li key={idx}>
                    Name: {passenger.name} | Phone: {passenger.phoneNumber} | Seats: {passenger.numberOfSeats}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No reserved passengers found.</p>
            )}
            <button onClick={() => setShowReservedPassengerList(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Homepage;