import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Buslist.css";
import LoadingPage from "../loadingPage/loadingPage";
import LoadingComponent from "../loadingComponent/loadingComponent";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const BusList = () => {
  const [buses, setBuses] = useState([]);
  const [usersByBus, setUsersByBus] = useState({});
  const [isLoading, setIsLoading] = useState(true);

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
      const bookedSeats = bus.seats.bookedSeats.filter((seat) => seat !== "0");

      if (bookedSeats.length === 0) return; // No booked users, skip fetching

      const responses = await Promise.all(
        bookedSeats.map((userId) =>
          axios.get(`${backEndUrl}/user/profile/${userId}`)
        )
      );

      // Extract user details (name and phone number)
      const userDetails = responses.map((response) => ({
        name: response.data.name,
        phoneNumber: response.data.phoneNumber, // Assuming the backend returns this field
      }));

      setUsersByBus((prev) => ({
        ...prev,
        [bus._id]: userDetails, // Store an array of user objects
      }));
    } catch (error) {
      console.error("Error fetching User Details.");
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
    try {
      await axios.delete(`${backEndUrl}/buses/${id}`);
      setBuses(buses.filter((bus) => bus._id !== id));
      alert("Bus deleted successfully!");
    } catch (err) {
      console.log("Error deleting the bus", err);
      alert("Error deleting the bus.");
    }
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
                {usersByBus[bus._id]?.length > 0 && !isLoading ? (
                  <ul>
                    {usersByBus[bus._id].map((user, index) => (
                      <p key={index} className="booked-user">
                        <span className="user-name">{user.name}</span>
                        <span className="user-phone">({user.phoneNumber})</span>
                      </p>
                    ))}
                  </ul>
                ) : (
                  <LoadingComponent />
                )}
              </div>

              <p>Price: {bus.price}</p>
              <p>Schedule: {bus.schedule}</p>
              <p>
                {bus.time.departureTime} <span>to</span> {bus.time.arrivalTime}
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
    </div>
  );
};

export default BusList;
