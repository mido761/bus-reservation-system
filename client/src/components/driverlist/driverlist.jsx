import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingComponent from "../loadingComponent/loadingComponent";
import LoadingScreen from "../loadingScreen/loadingScreen";
import LoadingPage from "../loadingPage/loadingPage";
import Overlay from "../overlayScreen/overlay";
import "./driverlist.css";

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
  const [passengersCount, setPassengersCount] = useState({
    total: 0,
    byRoute: {}
  });
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
      const response = await axios.get(`${backEndUrl}/seats/driver-list/${busId}`);
      const seats = Array.isArray(response.data.data.passengerList) ? response.data.data.passengerList : [];
      const users = Array.isArray(response.data.data.passengerList) ? response.data.data.passengerList : [];
      console.log(users)
      setSeatList(seats);
      setPassengers(users);
      
      // Calculate passenger counts
      const routeCounts = {};
      let total = users.length;
      
      seats.forEach((seat) => {
        const route = seat.route || "Unknown";
        routeCounts[route] = (routeCounts[route] || 0) + 1;
      });
      
      setPassengersCount({
        total,
        byRoute: routeCounts
      });
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching passengers for bus:", error);
      setSeatList([]);
      setPassengers([]);
      setPassengersCount({
        total: 0,
        byRoute: {}
      });
      setLoading(false);
    }
  };

  const handleBusSelect = (busId) => {
    setSelectedBusId(busId === selectedBusId ? null : busId);
    if (busId !== selectedBusId) {
      fetchPassengersForBus(busId);
    } else {
      // Reset counter if deselecting
      setPassengersCount({
        total: 0,
        byRoute: {}
      });
    }
  };
  // const handledriverList = (busId) => {
  //   navigate(`/driver-list/${busId}`);
   
  // };



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

 const getRowColor = (index) => {
    const fullGroups = Math.floor(passengers.length / 15);
    const lastGreenIndex = fullGroups * 15 - 1;
    return index <= lastGreenIndex ? "#376c37" : "red";
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

  // Passenger Counter Component
  const PassengerCounters = ({ counts }) => {
    if (counts.total === 0) return null;
    
    return (
      <div className="passenger-counters">
        <div className="counter-card total-counter">
          <div className="counter-icon">
            <img src="passengers-icon.png" alt="Total" className="counter-img" />
          </div>
          <div className="counter-details">
            <h4>Total Passengers</h4>
            <span className="counter-value">{counts.total}</span>
          </div>
        </div>
        
        <div className="route-counters">
          {Object.entries(counts.byRoute).map(([route, count]) => (
            <div className="counter-card route-counter" key={route}>
              <div className="counter-icon">
                <img src="route-icon.png" alt="Route" className="counter-img" />
              </div>
              <div className="counter-details">
                <h4>{route}</h4>
                <span className="counter-value">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
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
                  {/* Display passenger counters */}
                  <div className="passenger-counters">
                    <div className="counter-card total-counter">
                      <div className="counter-icon" data-icon="total"></div>
                      <div className="counter-details">
                        <h4>Total Passengers</h4>
                        <span className="counter-value">{passengersCount.total}</span>
                      </div>
                    </div>
                    
                    <div className="route-counters">
                      {Object.entries(passengersCount.byRoute).map(([route, count]) => (
                        <div className="counter-card route-counter" key={route}>
                          <div className="counter-icon" data-icon="route"></div>
                          <div className="counter-details">
                            <h4>{route}</h4>
                            <span className="counter-value">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="search-bar">
                    <input
                      type="text"
                      placeholder="Search by name, phone or route"
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
                            <th>User route</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPassengers.map((passenger, idx) => {
                            const seat =
                              seatList[passengers.indexOf(passenger)];
                               const rowColor = getRowColor(idx);
                            return (
                              <tr key={idx} style={{ backgroundColor: rowColor }} >
                                <td>{idx + 1}</td>
                                <td>
                                  {passenger.name}
                                </td>
                                <td>
                                  {passenger.route}
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
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-data">No Buses found.</p>
      )}
    </div>
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
}
export default BusList;