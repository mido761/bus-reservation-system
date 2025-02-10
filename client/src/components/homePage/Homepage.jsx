import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Homepage.css";
import authent from "../../authent";
import Footer from "../footer/footer";
import Navbar from "../navbar/nav";

const backEndUrl = import.meta.env.VITE_BACK_END_URL

const Homepage = () => {
  const navigate = useNavigate();
  // Bus Details
  const [pickupPoint, setPickupPoint] = useState('');
  const [arrivalPoint, setArrivalPoint] = useState('');
  const [date, setDate] = useState('');

  // const [selectedBus, setSelectedBus] = useState()
  // Contact form toggler
  const [showContactForm, setShowContactForm] = useState(false);
  // Available buses
  const [buses, setBuses] = useState([]);
  // Loading toggler
  const [isLoading, setIsLoading] = useState(false);  
  // Filtered buses 
  const [filteredBuses, setFilteredBuses] = useState(buses);
  // Contact form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  // overlay screen
  const [alertFlag, setAlertFlag] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  // Authentication 
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [isOpen, setIsOpen] = useState(false)
  // Authentication handling function
  authent()

  // Get available buses
  const fetchBuses = async () =>{
    try {`${backEndUrl}/buses`
      const res = await axios.get(`${backEndUrl}/buses`);
      setBuses(res.data);
      setFilteredBuses(res.data); // Ensure filteredBuses syncs with buses
    } catch (error) {
      console.error('Error fetching buses:', error);
      // setBuses([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    setIsLoading(true); // Show loading before fetching
    fetchBuses();
  }, []);

  // popular routes list
  const popularRoutes = [
    { id: 1, route: 'Borg to Cairo' },
    { id: 2, route: 'Alex to Borg' },
    { id: 3, route: 'Borg to Alex' },
    { id: 5, route: 'Sharm to Alex' },
  ];

  // selected routes
  const handleRouteSelect = route => setSelectedRoute(route);
  
  // Handle selected bus 
  const handleBusSelect = async bus => {
    console.log(bus._id)
    const req_user = await axios.get(`${backEndUrl}/auth/${bus._id}`, { withCredentials: true }); 

    navigate(`/seat-selection/${bus._id}`);//to get the bus id in the seat selection
  };

  // Show/Hide contact form
  const toggleContactForm = () => setShowContactForm(!showContactForm);

  // Buses Search hanlder
  const handleSearch = () => {
    if (!Array.isArray(buses)) {
      console.error('buses is not an array:', buses);
      return;
    }
  
    const filtered = buses.filter(bus =>
      (pickupPoint ? bus.location.pickupLocation === pickupPoint : true) &&
      (arrivalPoint ? bus.location.arrivalLocation === arrivalPoint : true) &&
      (date ? bus.schedule === date : true)
    );
    setFilteredBuses(filtered);
  };


  // Show when loading or fetching data
  if (isLoading) {
    return <p>Loading buses...</p>;
  }


  // Send contact message
  const handleContactSubmit = async (e) => {
    e.preventDefault();

    const contactData = {
      name,
      email,
      message,
    };

    try {
      const response = await axios.post(`${backEndUrl}/contact`, contactData);
      setResponseMessage('Message sent successfully');
      console.log('Contact message saved:', response.data);
    } catch (error) {
      setResponseMessage('Failed to send message');
      console.error('Error sending contact message:', error);
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  }


  return (
    <div className="home-page">
        {location.pathname === "/home" && <button className="add-bus-btn" onClick={() => navigate("/add-bus")}>Add a new Bus</button>}
        {location.pathname === "/home" && <button className="add-bus-btn" onClick={() => navigate("/notifications")}>Test</button>}

      <div className="search-container">
          {/* Search Bar */}
          <div className="bus-search-bar">
            <select onChange={e => setPickupPoint(e.target.value)} value={pickupPoint}>
              <option value="">Pickup Point</option>
              <option value="Borg Al-Arab">Borg Al-Arab</option>
              <option value="Alexandria">Alexandria</option>
              <option value="Cairo">Cairo</option>
              <option value="Sharm El-Sheikh">Sharm El-Sheikh</option>
              <option value="Aswan">Aswan</option>
              <option value="Luxor">Luxor</option>
            </select>
            <select onChange={e => setArrivalPoint(e.target.value)} value={arrivalPoint}>
              <option value="">Arrival Point</option>
              <option value="Cairo">Cairo</option>
              <option value="Borg Al-Arab">Borg Al-Arab</option>
              <option value="Alexandria">Alexandria</option>
              <option value="Sharm El-Sheikh">Sharm El-Sheikh</option>
              <option value="Aswan">Aswan</option>
              <option value="Luxor">Luxor</option>
              <option value="Hurghada">Hurghada</option>
            </select>
            <input
              type="date"
              onChange={e => setDate(e.target.value)}
              value={date}
            />
            <button className="search-btn" onClick={handleSearch}>Search</button>
          </div>

          {/* Popular Routes */}
          <div className="popular-routes">
            <h3>Popular Routes</h3>
            <div className="popular-routes-list">
              {popularRoutes.map(route => (
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

      {/* Available Buses */}
      <div>
        <h2>Avaialble buses</h2>
      </div>
      <div className="bus-list">
        {filteredBuses.length ? (
          filteredBuses.map(bus => (
            <div className="bus-container" key={bus.id} onClick={() => handleBusSelect(bus)}>
              {/* <h3>{bus.name}</h3> */}
              <p>Schedule: {bus.schedule}</p>
              <p>{bus.location.pickupLocation} <span>To </span>{bus.location.arrivalLocation}</p>
              <p>Available Seats: {bus.seats.totalSeats}</p>
              <p>Price: {bus.price}</p>
              {/* <p>Departure time: {bus.time.departureTime}</p>
              <p>Arrival time: {bus.time.arrivalTime}</p>
              <p>Minimum number of passengers: {bus.minNoPassengers}</p>
              <p>Cancel time allowance: {bus.allowance.cancelTimeAllowance}</p>
              <p>Booking time allowance: {bus.allowance.bookingTimeAllowance}</p>
              <p>Allowed number of bags: {bus.allowedNumberOfBags}</p> */}

            </div>
          ))
        ) : (
          <p>No buses found matching your criteria.</p>
        )}
      </div>

      {/* contact form */}
      <div className="contact-us-bar" onClick={toggleContactForm}>
        <h3>Contact Us</h3>
      </div>

      {showContactForm && (
        <div className={`contact-us-form ${showContactForm ? 'active' : ''}`}>
          <h3>Write Us a Message</h3>
          <form onSubmit={handleContactSubmit}>
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <textarea
              placeholder="Your Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            ></textarea>
            <button type="submit">Send Message</button>
          </form>
          {responseMessage && <p>{responseMessage}</p>}
        </div>
      )}

      {alertFlag && (
        <Overlay alertFlag={alertFlag} alertMessage={alertMessage} setAlertFlag={setAlertFlag}/>
      )}
    </div>
  );
};

export default Homepage;
