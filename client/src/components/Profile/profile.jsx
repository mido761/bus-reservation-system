import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEnvelope, FaPhone } from "react-icons/fa"; // Import icons
import "./UserProfile.css";
import Dashboard from "../dashboard/Dashboard";
import LoadingPage from "../loadingPage/loadingPage";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const UserProfile = () => {
  const [busDetails, setBusDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userDetails, setUserDetails] = useState({}); // Changed from [] to {}

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const req_user = await axios.get(`${backEndUrl}/auth`, {
          withCredentials: true,
        });

        const userId = req_user.data.userId;
        setUserId(userId);

        // Fetch user details
        const res = await axios.get(`${backEndUrl}/user/profile/${userId}`);
        setUserDetails(res.data);

        // Fetch booked buses
        const busIds = res.data.bookedBuses?.buses || [];

        if (busIds.length > 0) {
          const response = await axios.get(`${backEndUrl}/buses/userBuses`, {
            params: { ids: busIds.join(",") },
          });
          setBusDetails(response.data);
        } else {
          setError("No booked buses found.");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to fetch user details.");
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="profile-container">
      <div className="user-profile">
        <div className="avatar"></div>

        {/* Name inside a bordered box */}
        <h1 className="user-name-box">{userDetails?.name}</h1>

        {/* Email & Phone with Icons */}
        <p className="user-detail">
          <FaEnvelope className="icon" /> {userDetails?.email}
        </p>
        <p className="user-detail">
          <FaPhone className="icon" /> {userDetails?.phoneNumber}
        </p>
      </div>

      <Dashboard error={error} busDetails={busDetails} userId={userId} />
    </div>
  );
};

export default UserProfile;
