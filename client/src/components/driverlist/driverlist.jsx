import { useEffect, useState } from "react";
import axios from "axios";
import LoadingComponent from "../loadingComponent/loadingComponent";
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
  const [selectedDate, setSelectedDate] = useState("");
  const [alertFlag, setAlertFlag] = useState(false);
  const [passengersCount, setPassengersCount] = useState({
    total: 0,
    byRoute: {}
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const fetchBusList = async () => {
    try {
      const response = await axios.get(`${backEndUrl}/driver-list/buses`);
      const buses = response.data;
      
      // Group buses by date and sort within each date by departure time
      const sortedBuses = buses.sort((a, b) => {
        const dateCompare = new Date(a.schedule) - new Date(b.schedule);
        if (dateCompare !== 0) return dateCompare;
        return a.departureTime.localeCompare(b.departureTime);
      });

      setBusList(sortedBuses);
      
      // Set initial selected date to the earliest date if not already set
      if (sortedBuses.length > 0 && !selectedDate) {
        setSelectedDate(sortedBuses[0].schedule);
      }
      
      setPageLoading(false);
    } catch (error) {
      console.error("Error fetching bus list:", error);
      setPageLoading(false);
    }
  };

  const fetchPassengersForBus = async (busId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${backEndUrl}/driver-list/seats/${busId}`);
      const seats = Array.isArray(response.data.data.passengerList) ? response.data.data.passengerList : [];
      const users = Array.isArray(response.data.data.passengerList) ? response.data.data.passengerList : [];
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

  useEffect(() => {
    fetchBusList();
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Group buses by date
  const busesByDate = busList.reduce((acc, bus) => {
    const date = bus.schedule;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(bus);
    return acc;
  }, {});

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

  if (pageLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="bus-list-container">
      <div className="section-header">
        <h2>Available Buses</h2>
      </div>
      
      <div className="bus-selection-area">
        {Object.keys(busesByDate).length > 0 ? (
          <>
            <div className="date-tabs">
              {Object.entries(busesByDate).map(([date, buses]) => (
                <button
                  key={date}
                  className={`date-tab ${selectedDate === date ? "selected" : ""}`}
                  onClick={() => setSelectedDate(date)}
                >
                  <div className="date-tab-content">
                    <span className="date-label">{formatDate(date)}</span>
                    <span className="bus-count">
                      {buses.length} {buses.length === 1 ? "bus" : "buses"}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="time-buttons-row">
              {busesByDate[selectedDate]?.map((bus) => (
                <button
                  key={bus._id}
                  className={`time-button ${selectedBusId === bus._id ? "selected" : ""}`}
                  onClick={() => handleBusSelect(bus._id)}
                >
                  <div className="time-display">{convertTo12HourFormat(bus.departureTime)}</div>
                  <div className="route-mini-info">
                    {bus.location.pickupLocation} → {bus.location.arrivalLocation}
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="no-buses">No buses available.</div>
        )}
        
        {selectedBusId && (
          <div className="passenger-details-panel">
            <div className="selected-bus-info">
              {busList.find(bus => bus._id === selectedBusId) && (
                <div className="selected-route">
                  <span className="route-from">{busList.find(bus => bus._id === selectedBusId).location.pickupLocation}</span>
                  <span className="route-arrow">→</span>
                  <span className="route-to">{busList.find(bus => bus._id === selectedBusId).location.arrivalLocation}</span>
                  <span className="route-schedule">{busList.find(bus => bus._id === selectedBusId).schedule}</span>
                </div>
              )}
            </div>
            
            <div className="passenger-stats-row">
              <div className="stat-card total">
                <div className="stat-label">Total Passengers</div>
                <div className="stat-value">{passengersCount.total}</div>
              </div>
              
              {Object.entries(passengersCount.byRoute).map(([route, count]) => (
                <div className="stat-card route" key={route}>
                  <div className="stat-label">{route}</div>
                  <div className="stat-value">{count}</div>
                </div>
              ))}
            </div>
            
            <div className="search-container">
              <input
                type="text"
                placeholder="Search by name, phone or route"
                value={searchQuery}
                onChange={handleSearchChange}
                className="search-input"
              />
            </div>
            
            {loading ? (
              <LoadingComponent />
            ) : Array.isArray(filteredPassengers) && filteredPassengers.length > 0 ? (
              <div className="passenger-table-wrapper">
                <table className="passenger-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Route</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPassengers.map((passenger, idx) => {
                      const rowColor = getRowColor(idx);
                      return (
                        <tr key={idx} style={{ backgroundColor: rowColor }}>
                          <td>{idx + 1}</td>
                          <td>{passenger.name}</td>
                          <td>{passenger.route}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-results">No passengers found matching your search.</div>
            )}
          </div>
        )}
      </div>
      
      {alertFlag && (
        <Overlay
          alertFlag={alertFlag}
          setAlertFlag={setAlertFlag}
        />
      )}
    </div>
  );
};

export default BusList;