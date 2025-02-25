import React, { useEffect, useState } from "react";
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

  // Fetch all buses
  const fetchBuses = async () => {
    try {
      const res = await axios.get(`${backEndUrl}/buses`);
      setBuses(res.data);
    } catch (error) {
      console.error("Error fetching Buses.");
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    }
  };

  // Fetch users for a given bus
  const fetchUsersForBus = async (bus) => {
    setIsLoading(true);
    try {
      // Step 1: Count occurrences of each user ID
      const userCounts = bus.seats.bookedSeats.reduce((acc, userId) => {
        if (userId && userId !== "0") {
          // Exclude invalid user IDs
          acc[userId] = (acc[userId] || 0) + 1;
        }
        return acc;
      }, {});

      // Step 2: Fetch unique users
      const uniqueUserIds = Object.keys(userCounts);
      const response = await axios.post(`${backEndUrl}/user/profiles`, {
        userIds: uniqueUserIds,
      });

      // Step 3: Merge user data with counts
      const usersWithCounts = response.data.map((user) => ({
        ...user,
        count: userCounts[user._id], // Add count of occurrences
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

  // Fetch users when buses are loaded
  useEffect(() => {
    fetchBuses();
  }, []);

  useEffect(() => {
    buses.forEach((bus) => fetchUsersForBus(bus));
  }, [buses]);

  // Handle bus deletion
  const handleDel = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`${backEndUrl}/buses/${id}`);
      setBuses(buses.filter((bus) => bus._id !== id));

      setTimeout(() => {
        setLoading(false);
        setAlertMessage("Bus deleted successfully!");
        setAlertFlag(true);
      }, 1000);

      setTimeout(() => {
        setAlertFlag(false);
      }, 2200);
    } catch (err) {
      setTimeout(() => {
        setLoading(false);
        setAlertMessage("⚠️ Error deleting the bus");
        setAlertFlag(true);
      }, 1000);

      setTimeout(() => {
        setAlertFlag(false);
      }, 2200);
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

  return (
    <div className="bus-list-page">
      <br />
      <div onClick={fetchBuses} className="show-buses-btn">
        Show Available Buses
      </div>
      <br />
      <div className="bus-list">
        {buses.length > 0 ? (
          buses.map((bus) => (
            <div key={bus._id} className="bus-container">
              <h1>Bus details</h1>
              <p>
                {bus.location.pickupLocation} <span>to</span>{" "}
                {bus.location.arrivalLocation}
              </p>
              <div className="booked-users">
                <h3>Seats Booked By:</h3>
                {usersByBus[bus._id]?.length > 0 ? (
                  <ul>
                    {usersByBus[bus._id].map((user, index) => (
                      <p key={index} className="booked-user">
                        <span className="user-name">{user.name}</span>
                        <span className="user-phone">({user.phoneNumber})</span>
                        <span className="user-count">
                          {" "}
                          &nbsp;x{user.count}
                        </span>{" "}
                        {/* Show count */}
                      </p>
                    ))}
                  </ul>
                ) : isLoading ? (
                  <LoadingComponent />
                ) : (
                  <p>No booked seats</p>
                )}
              </div>

              <p>Price: {bus.price}</p>
              <p>Schedule: {bus.schedule}</p>
              <p>
                {convertTo12HourFormat(bus.time.departureTime)}
              </p>
              <p>Allowed number of bags: {bus.allowedNumberOfBags}</p>
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

      <Overlay
        alertFlag={alertFlag}
        alertMessage={alertMessage}
        setAlertFlag={setAlertFlag}
      />
    </div>
  );
};

export default BusList;
