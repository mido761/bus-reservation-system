import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Buslist.css";
import LoadingPage from "../loadingPage/loadingPage";
import LoadingComponent from "../loadingComponent/loadingComponent";
import LoadingScreen from "../loadingScreen/loadingScreen";
import Overlay from "../overlayScreen/overlay";
import e from "cors";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const BusList = () => {
  const [buses, setBuses] = useState([]);
  const [usersByBus, setUsersByBus] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [alertFlag, setAlertFlag] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("userName");
  const [originalBuses, setOriginalBuses] = useState([]);
  const [originalUsersByBus, setOriginalUsersByBus] = useState({});
  const [selectedDepartureTime, setSelectedDepartureTime] = useState(null);
  const [selectedArrivalLocation, setSelectedArrivalLocation] = useState("");
  const [arrivalLocations, setArrivalLocations] = useState([]);

  const navigate = useNavigate();

  const fetchBuses = async () => {
    try {
      const res = await axios.get(`${backEndUrl}/buses`);
      setFilteredBuses(res.data);
      setBuses(res.data);
      setOriginalBuses(res.data);
      console.log(filteredBuses)
    } catch (error) {
      console.error("Error fetching Buses.");
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    }
  };

  const fetchUsersForBus = async (bus) => {
    if (!bus.seats || !Array.isArray(bus.seats.bookedSeats)) {
      console.warn(`Bus ${bus._id} has no booked seats.`);
      return;
    }
    setIsLoading(true);
    try {
      const userCounts = bus.seats.bookedSeats.reduce((acc, userId) => {
        if (userId && userId !== "0") {
          acc[userId] = (acc[userId] || 0) + 1;
        }
        return acc;
      }, {});

      const uniqueUserIds = Object.keys(userCounts);
      if (uniqueUserIds.length === 0) {
        setUsersByBus((prev) => ({ ...prev, [bus._id]: [] }));
        setOriginalUsersByBus((prev) => ({ ...prev, [bus._id]: [] }));
        setIsLoading(false);
        return;
      }
      if (uniqueUserIds.length === 0) {
        setUsersByBus((prev) => ({ ...prev, [bus._id]: [] }));
        setIsLoading(false);
        return;
      }
      const response = await axios.post(`${backEndUrl}/user/profiles`, {
        userIds: uniqueUserIds,
      });

      const usersWithCounts = response.data.map((user) => ({
        ...user,
        count: userCounts[user._id],
        // Add count of occurrences
      }));

      setUsersByBus((prev) => ({ ...prev, [bus._id]: usersWithCounts }));
      setOriginalUsersByBus((prev) => ({ ...prev, [bus._id]: usersWithCounts }));
    } catch (error) {
      console.error("Error fetching User Details.", error);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);
  useEffect(() => {
    if (!selectedDepartureTime && !selectedArrivalLocation) {
      setFilteredBuses(originalBuses);
    } else {
      const filtered = originalBuses.filter((bus) => 
        (!selectedDepartureTime || bus.time.departureTime === selectedDepartureTime) &&
        (!selectedArrivalLocation || bus.location.arrivalLocation === selectedArrivalLocation)
      );
      setFilteredBuses(filtered);
    }
  }, [selectedDepartureTime, selectedArrivalLocation, originalBuses]); // Update filter when departure time or arrival location changes
  
  useEffect(() => {
    if (buses.length > 0) {
      buses.forEach((bus) => fetchUsersForBus(bus));
    }
  }, [buses]);
  // useEffect(() => {
  // //   if (userSearchQuery.trim() !== "") {
  // //     handleUserSearchChange({ target: { value: userSearchQuery } });
  // //   }
  // // }, [usersByBus]);

  const handleDel = async (id) => {
    const firstConfirmation = window.confirm(
      "Are you sure you want to delete this bus?"
    );
    if (!firstConfirmation) return;

    const secondConfirmation = window.confirm(
      "This action cannot be undone. Do you want to proceed?"
    );
    if (!secondConfirmation) return;

    setLoading(true);
    try {
      await axios.delete(`${backEndUrl}/buses/${id}`);
      setBuses(buses.filter((bus) => bus._id !== id));
      setFilteredBuses((prev) => prev.filter((bus) => bus._id !== id));

      setLoading(false);
      setAlertMessage("✅ Bus deleted successfully!");
      setAlertFlag(true);

      setTimeout(() => {
        setAlertFlag(false);
      }, 2200);
    } catch (err) {
      setLoading(false);
      setAlertMessage("⚠️ Error deleting the bus");
      setAlertFlag(true);

      setTimeout(() => {
        setAlertFlag(false);
      }, 2200);
    }
  };


  //navigte with the bus id in the url to enable me to edit the bus
  const handleEdit = (busId) => {
    navigate(`/edit-bus/${busId}`);
  };


  const handleCheckIn = async (userId, busId) => {
    setLoading(true);
    try {
      await axios.put(`${backEndUrl}/user/check-in/${userId}`); // Send check-in request

      // Update the state to mark the user as checked in
      setUsersByBus((prev) => ({
        ...prev,
        [busId]: prev[busId].map((user) =>
          user._id === userId ? { ...user, checkInStatus: true } : user
        ),
      }));

      setTimeout(() => {
        setLoading(false);
        setAlertMessage("Checked in successfully!");
        setAlertFlag(true);
      }, 1200);
      setTimeout(() => setAlertFlag(false), 2000);
    } catch (error) {
      console.error("Check-in failed", error);
      setTimeout(() => {
        setLoading(false);
        setAlertMessage("⚠️ Error during check-in");
        setAlertFlag(true);
      }, 1200);
      setTimeout(() => setAlertFlag(false), 2000);
    }
  };

  const handleUserSearchChange = (e) => {
    let query = e.target.value;
    setUserSearchQuery(query); // Always update state

    // 🔹 Reset search when input is empty
    if (query.trim() === "") {
        setFilteredBuses(originalBuses); // Reset buses to full list
        setUsersByBus(originalUsersByBus); // Reset users to full list
        return;
    }

    // 🔹 Validation for input type
    if (searchType === "busNumber" || searchType === "userNumber") {
        if (!/^\d+$/.test(query)) {
            return; // Stops further execution if invalid
        }
    } else if (searchType === "userName") {
        if (!/^[a-zA-Z\s]+$/.test(query)) {
            return; // Stops further execution if invalid
        }
    }

    query = query.toLowerCase();
    let filteredBusList = [];
    let filteredUsersByBus = {};

    if (searchType === "busNumber") {
        filteredBusList = originalBuses.filter(
            (bus) =>
                String(bus.busNumber).toLowerCase().includes(query) &&
                (selectedDepartureTime ? bus.time.departureTime === selectedDepartureTime : true) &&
                (selectedArrivalLocation ? bus.location.arrivalLocation === selectedArrivalLocation : true)
        );

        // Fetch users inside the filtered buses
        filteredBusList.forEach((bus) => {
            if (originalUsersByBus[bus._id]) {
                filteredUsersByBus[bus._id] = originalUsersByBus[bus._id];
            }
        });

    } else if (searchType === "userName") {
        originalBuses.forEach((bus) => {
            if ((selectedDepartureTime && bus.time.departureTime !== selectedDepartureTime) || 
                (selectedArrivalLocation && bus.location.arrivalLocation !== selectedArrivalLocation)) return;

            const matchingUsers = originalUsersByBus[bus._id]?.filter((user) =>
                user.name.toLowerCase().includes(query)
            );

            if (matchingUsers?.length) {
                filteredBusList.push(bus);
                filteredUsersByBus[bus._id] = matchingUsers;
            }
        });

    } else if (searchType === "userNumber") {
        originalBuses.forEach((bus) => {
            if ((selectedDepartureTime && bus.time.departureTime !== selectedDepartureTime) || 
                (selectedArrivalLocation && bus.location.arrivalLocation !== selectedArrivalLocation)) return;

            const matchingUsers = originalUsersByBus[bus._id]?.filter((user) =>
                user.phoneNumber?.toString().includes(query)
            );

            if (matchingUsers?.length) {
                filteredBusList.push(bus);
                filteredUsersByBus[bus._id] = matchingUsers;
            }
        });
    }

    setFilteredBuses(filteredBusList);
    setUsersByBus(filteredUsersByBus);
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

  // Handle Check-out Function
  const handleCheckOut = async (userId, busId) => {
    setLoading(true);
    try {
      await axios.put(`${backEndUrl}/user/check-out/${userId}`); // Send check-in request

      // Update the state to mark the user as checked in
      setUsersByBus((prev) => ({
        ...prev,
        [busId]: prev[busId].map((user) =>
          user._id === userId ? { ...user, checkInStatus: false } : user
        ),
      }));

      setTimeout(() => {
        setLoading(false);
        setAlertMessage("Checked out successfully!");
        setAlertFlag(true);
      }, 1200);
      setTimeout(() => setAlertFlag(false), 2000);
    } catch (error) {
      console.error("Check-in failed", error);
      setTimeout(() => {
        setLoading(false);
        setAlertMessage("⚠️ Error during check-in");
        setAlertFlag(true);
      }, 1200);
      setTimeout(() => setAlertFlag(false), 2000);
    }
  };

  const handleCheckStatus = async (userId, busId, userStatus) => {
    if (userStatus) {
      const checkInConfirmation = window.confirm(
        "Mark user as NOT checked-in?"
      );
      if (!checkInConfirmation) return;
      return handleCheckOut(userId, busId);
    } else {
      const checkOutConfirmation = window.confirm("Mark user as checked-in?");
      if (!checkOutConfirmation) return;
      return handleCheckIn(userId, busId);
    }
  };

  return (
    <div className="bus-list-page">
      {/* 🔹 Top Section with Filters */}
      <div className="top-section">
        <div className="search-container">
          {/* 🔹 Search Type Dropdown */}
          <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
            <option value="Filter by">Filter by</option>
            <option value="userName">User Name</option>
            <option value="userNumber">User Number</option>
            <option value="busNumber">Bus Number</option>
          </select>
  
          {/* 🔹 Search Input */}
          <div className="input-wrapper">
            <input
              type="text"
              placeholder={`Enter ${searchType === "busNumber" ? "bus number" : "user details"}...`}
              value={userSearchQuery}
              onChange={handleUserSearchChange}
            />
          </div>
  
          {/* 🔹 Departure Time Filter */}
          <select value={selectedDepartureTime} onChange={(e) => setSelectedDepartureTime(e.target.value)}>
            <option value="">All Departure Times</option>
            {[...new Set(originalBuses.map((bus) => bus.time.departureTime))].map((time) => (
              <option key={time} value={time}>{convertTo12HourFormat(time)}</option>
            ))}
          </select>
  
          {/* 🔹 Arrival Location Filter */}
          <select value={selectedArrivalLocation} onChange={(e) => setSelectedArrivalLocation(e.target.value)}>
            <option value="">All Arrival Locations</option>
            {[...new Set(originalBuses.map((bus) => bus.location.arrivalLocation))].map((location) => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>
      </div>
  
      {/* 🔹 Bus List */}
      <div className="bus-list">
        {/* 🔹 Bus Count & Passenger Count */}
        {filteredBuses.length > 0 && (
          <div className="counters">
            <p className="buses-count" style={{ fontSize: "40px", textAlign: "center" }}>🚐 {filteredBuses.length}</p>
            <p className="passengers-count" style={{ fontSize: "40px" }}>🧍🏼 {filteredBuses.reduce((sum, bus) => sum + (15 - bus.seats.availableSeats), 0)}</p>
          </div>
        )}
  
        {/* 🔹 Display Filtered Buses */}
        {filteredBuses.map((bus) => (
          <div key={bus._id} className="bus-container">
            {/* 🔹 Bus Info */}
            <p className="bus-number">{bus.busNumber}</p>
            <p>{bus.location.pickupLocation} <span style={{ color: "var(--text-color)" }}>To</span> {bus.location.arrivalLocation}</p>
            <p className="departure-time">🕒 Departure: {convertTo12HourFormat(bus.time.departureTime)}</p>
  
            {/* 🔹 Booked Users List */}
            <div className="booked-users">
              {usersByBus[bus._id]?.length > 0 ? (
                <ul>
                  {usersByBus[bus._id].map((user, index) => (
                    <p
                      key={index}
                      className={`booked-user ${user.checkInStatus ? "green" : "red"}`}
                      onClick={() => handleCheckStatus(user._id, bus._id, user.checkInStatus)}
                    >
                      <span className="user-info">
                        <span className="user-name">{user.name ? user.name.replace(/_/g, " ") : "Unknown"}</span>
                        <span className="user-seats">
                          ({user.bookedBuses.seats.map(seat => seat - Math.floor(seat / 7) - 1).join(", ")})
                        </span>
                      </span>
                      <span className="user-phone">{user.phoneNumber}</span>
                      <span className="user-time">
                        {(() => {
                          if (!user.bookedTime || user.bookedTime.length === 0) return "No bookings";
                          const mostRecentTime = new Date(Math.max(...user.bookedTime.map(time => new Date(time).getTime())));
                          const diffMinutes = Math.floor((Date.now() - mostRecentTime) / (1000 * 60));
                          const hours = Math.floor(diffMinutes / 60);
                          const minutes = diffMinutes % 60;
                          return hours > 0 ? `${hours} h ${minutes} m ago` : `${minutes} m ago`;
                        })()}
                      </span>
                    </p>
                  ))}
                </ul>
              ) : isLoading ? (
                <LoadingComponent />
              ) : (
                <p>No booked seats</p>
              )}
            </div>
  
            {/* 🔹 Action Buttons */}
            <div className="actions-container">
              <button className="del-btn" onClick={() => handleDel(bus._id)}>
                <img src="delete.png" alt="Delete" style={{ width: "24px", height: "24px" }} />
              </button>
              <button className="edit-btn" onClick={() => handleEdit(bus._id)}>
                <img src="editing.png" alt="Edit" style={{ width: "24px", height: "24px" }} />
              </button>
            </div>
          </div>
        ))}
      </div>
  
      {/* 🔹 Loading & Alerts */}
      {alertFlag && (
        <Overlay alertFlag={alertFlag} alertMessage={alertMessage} setAlertFlag={setAlertFlag} />
      )}
    </div>

    
  );
}  
export default BusList;