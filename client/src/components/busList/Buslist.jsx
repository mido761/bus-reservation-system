import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Buslist.css";
import LoadingPage from "../loadingPage/loadingPage";
import LoadingComponent from "../loadingComponent/loadingComponent";
import LoadingScreen from "../loadingScreen/loadingScreen";
import Overlay from "../overlayScreen/overlay";

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
  const navigate = useNavigate();


  const fetchBuses = async () => {
    try {
      const res = await axios.get(`${backEndUrl}/buses`);
      setFilteredBuses(res.data);
      setBuses(res.data);
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
    buses.forEach((bus) => fetchUsersForBus(bus));
  }, [buses]);

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
    try {
      await axios.put(`${backEndUrl}/user/check-in/${userId}`); // Send check-in request

      // Update the state to mark the user as checked in
      setUsersByBus((prev) => ({
        ...prev,
        [busId]: prev[busId].map((user) =>
          user._id === userId ? { ...user, checkInStatus: true } : user
        ),
      }));

      setAlertMessage("User checked in successfully!");
      setAlertFlag(true);
      setTimeout(() => setAlertFlag(false), 2000);
    } catch (error) {
      console.error("Check-in failed", error);
      setAlertMessage("⚠️ Error during check-in");
      setAlertFlag(true);
      setTimeout(() => setAlertFlag(false), 2000);
    }
  };

  const handleUserSearchChange = (e) => {
    let query = e.target.value.trim();
  
    // Validation based on search type
    if (searchType === "busNumber" || searchType === "userNumber") {
      if (!/^\d*$/.test(query)) {
        console.warn("Only numbers are allowed for Bus Number and Phone Number.");
        return;
      }
    } else if (searchType === "userName") {
      if (!/^[a-zA-Z\s]*$/.test(query)) {
        console.warn("Only letters are allowed for User Name.");
        return;
      }
    }
  
    query = query.toLowerCase();
    setUserSearchQuery(query);
  
    if (query === "") {
      setFilteredBuses(buses);
      return;
    }
  
    if (searchType === "busNumber") {
      console.log("Filtering by bus number:", query);
      setFilteredBuses(
        buses.filter((bus) =>
          String(bus.busNumber).toLowerCase().includes(query)
        )
      );
    } else if (searchType === "userName") {
      if (!usersByBus || Object.keys(usersByBus).length === 0) {
        console.warn("Users data not loaded yet!");
        return;
      }
      setFilteredBuses(
        buses.filter((bus) =>
          usersByBus[bus._id]?.some((user) =>
            user.name.toLowerCase().includes(query)
          )
        )
      );
    } else if (searchType === "userNumber") {
      if (!usersByBus || Object.keys(usersByBus).length === 0) {
        console.warn("Users data not loaded yet!");
        return;
      }
      setFilteredBuses(
        buses.filter((bus) =>
          usersByBus[bus._id]?.some((user) =>
            user.phoneNumber && user.phoneNumber.toString().includes(query)
          )
        )
      );
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

  // Handle Check-out Function
  const handleCheckOut = async (userId, busId) => {
    try {
      await axios.put(`${backEndUrl}/user/check-out/${userId}`); // Send check-in request

      // Update the state to mark the user as checked in
      setUsersByBus((prev) => ({
        ...prev,
        [busId]: prev[busId].map((user) =>
          user._id === userId ? { ...user, checkInStatus: false } : user
        ),
      }));

    } catch (error) {
      console.error("Check-in failed", error);
      setAlertMessage("⚠️ Error during check-in");
      setAlertFlag(true);
      setTimeout(() => setAlertFlag(false), 2000);
    }
  };


  return (
    <div className="bus-list-page">
      {alertFlag && (
        <div className={`alert-message ${alertFlag ? "show" : ""}`}>
          {alertMessage}
        </div>
      )}
      <br />
      <div onClick={fetchBuses} className="show-buses-btn">
        Show Available Buses
        </div>
        <br />
        <div className="search-container">
          <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
            <option value="userName">Filter by User Name</option>
            <option value="userNumber">Filter by User Number</option>
            <option value="busNumber">Filter by Bus Number</option>
          </select>
          <div className="input-wrapper">
            <input
              type="text"
              placeholder={`Enter ${searchType === "busNumber" ? "bus number" : "user details"}...`}
              value={userSearchQuery}
              onChange={handleUserSearchChange}
            />
          </div>
        </div>
      <br />
      <div className="bus-list">
        <div className="counters" >
          {filteredBuses.length > 0 && <p className="buses-count" style={{ fontSize: "40px", textAlign: "center" }}> 🚐 {filteredBuses.length}</p>}
          {filteredBuses.length > 0 && <p className="passengers-count" style={{ fontSize: "40px" }}>🧍🏼{(filteredBuses.length * 15) - filteredBuses.reduce((sum, bus) => sum + (bus.seats.availableSeats || 0), 0)}</p>}
        </div>
        {filteredBuses.length > 0 ? (
          filteredBuses.map((bus) => (
            <div key={bus._id} className="bus-container">
              <p className="bus-number"> {bus.busNumber}</p>
              <p>{bus.location.pickupLocation} <span>to</span> {bus.location.arrivalLocation}</p>
              <button onClick={() => handleEdit(bus._id)}>Edit</button>
              <div className="booked-users">
                <h3>Seats Booked By:</h3>
                {usersByBus[bus._id]?.length > 0 ? (
                  <ul>
                    {usersByBus[bus._id].map((user, index) => (
                      <p key={index} className="booked-user">
                        <span className="user-info">
                          <span className="user-name">
                            {user.name
                              ? user.name.replace(/_/g, " ")
                              : "Unknown"}
                          </span>
                          <span className="user-seats">
                            (
                            {user.bookedBuses.seats
                              .map((seat) => seat < 7
                                ? seat - 1
                                : seat > 7 && seat < 10
                                  ? seat - 2
                                  : seat > 10 && seat < 14
                                    ? seat - 3
                                    : seat - 4)
                              .join(", ")}
                            )
                          </span>
                        </span>
                        <span className="user-phone">{user.phoneNumber}</span>
                        <span className="check-in-status">
                          {/* {user.checkInStatus} */}
                          {user.checkInStatus
                            ? "✅"
                            : "❌"}
                        </span>
                        {!user.checkInStatus ? (
                          <button className="check-in-btn"
                            onClick={() => handleCheckIn(user._id, bus._id)}
                          >
                            Check In
                          </button>
                        ) : (
                          <button className="check-out-btn"
                            onClick={() => handleCheckOut(user._id, bus._id)}
                          >
                            Check out
                          </button>
                        )}


                      </p>
                    ))}
                  </ul>
                ) : isLoading ? (
                  <LoadingComponent />
                ) : (
                  <p>No booked seats</p>
                )}
              </div>
              <button onClick={() => handleDel(bus._id)}>Delete Bus</button>
            </div>
          ))
        ) : isLoading ? (
          <LoadingPage />
        ) : (
          <p>No buses found.</p>
        )}
      </div>

      {loading && <LoadingScreen />}
      {isLoading && <Overlay message="Loading Buses..." />}
    </div>
  );
};
export default BusList;
