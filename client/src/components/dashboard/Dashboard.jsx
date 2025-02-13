import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import authen from "../../authent";
import axios from "axios";
import { get } from "mongoose";
import "./dashboard.css";
import LoadingScreen from "../loadingScreen/loadingScreen";
const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const Dashboard = () => {
  authen();

  const navigate = useNavigate();
  const [busDetails, setBusDetails] = useState([]);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [busAndSeat, setBusAndSeat] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [seats, setSeats] = useState([]);
  const hasFetched = useRef(false); // Ref to track whether fetch has been performed

  const fetchUsers = async () => {
    try {
      // Get session data
      const req_user = await axios.get(`${backEndUrl}/auth`, {
        withCredentials: true,
      });

      // Store user ID in userID state from session data
      setUserId(req_user.data.userId);
      const userId = req_user.data.userId;

      // Get user data
      const res = await axios.get(`${backEndUrl}/user/profile/${userId}`);
      setUserDetails(res.data);

      const userDetails = res.data;
      const busIds = userDetails.bookedBuses.buses;

      let buses = [];
      for (let i = 0; i < busIds.length; i++) {
        const busDetails = await axios.get(`${backEndUrl}/buses/${busIds[i]}`);
        buses.push(busDetails.data);
        console.log(busDetails.data);
      }

      setBusDetails((prevBuses) => [...prevBuses, ...buses]);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to fetch bus details.");
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return; // Exit if the fetch has already been performed
    hasFetched.current = true; // Mark fetch as performed

    fetchUsers(); // Fetch user and bus details only once
  }, []);

  useEffect(() => {
    console.log(busDetails);
  }, [busDetails]);

  const handleBusSelect = (bus) => {
    navigate(`/seat-selection/${bus._id}`); //to get the bus id in the seat selection
  };

  if (isLoading) {
    return <LoadingScreen/>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <>
      <div className="dashboard-container">
        <h1 className="dashboard-title">Dashboard</h1>
        <div className="dashboard-cards">
          {busDetails.length > 0 ? (
            busDetails.map(
              (bus, index) =>
                bus !== null && (
                  <div
                    className="dashboard-card"
                    key={index}
                    onClick={() => handleBusSelect(bus)}
                  >
                    <p>
                      {bus.location.pickupLocation} to{" "}
                      {bus.location.arrivalLocation}
                    </p>
                    <p>{bus.schedule}</p>
                    <p>
                      {bus.time.departureTime} to {bus.time.arrivalTime}
                    </p>
                    <p>
                      {bus.seats.bookedSeats
                        .map((seat, index) =>
                          seat === userId ? index + 1 : null
                        )
                        .filter((index) => index !== null)
                        .join(", ")}
                    </p>
                  </div>
                )
            )
          ) : (
            <p>No buses found.</p>
          )}

          <br />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
