import React, { useState, useEffect } from "react";
import axios from "axios";
// import { FaEnvelope, FaPhone } from "react-icons/fa6";
import "./UserProfile.css";
import Dashboard from "../dashboard/Dashboard";
import LoadingPage from "../loadingPage/loadingPage";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const UserProfile = () => {
  const [busDetails, setBusDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userDetails, setUserDetails] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      let busIds = [];
      try {
        // Fetch authenticated user
        // const req_user = await axios.get(`${backEndUrl}/auth`, {
        //   withCredentials: true,
        // });
        // setUserId(req_user.data.userId);
        // const userId = req_user.data.userId;

        // Fetch user profile
        const res = await axios.get(`${backEndUrl}/user/profile`, {
          withCredentials: true,
        });
        setUserDetails(res.data);
        const userDetails = res.data;

        // Fetch user's buses
        // busIds = userDetails.bookedBuses?.buses || [];

        // if (busIds.length > 0) {
        //   const response = await axios.get(`${backEndUrl}/buses/userBuses`, {
        //     params: { ids: busIds.join(",") },
        //   });
        const userBusesResponse = await axios.get(
          `${backEndUrl}/user/form-based-bus/${userId}`
        );
        console.log(userBusesResponse);
        setBusDetails(userBusesResponse.data);
        // } else {
        //   setError("No booked buses found.");
        // }
      } catch (err) {
        console.error("Error fetching user or buses:", err);
        setError("Failed to fetch user details or buses.");
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1000); // 1 second loading
      }
    };

    fetchData();
  }, []);

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return "";
    const names = name.trim().split(" ");
    return names
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="card">
          {/* Avatar */}
          <div className="avatar">
            {userDetails?.username ? getInitials(userDetails.username) : "?"}
          </div>

          {/* User Info */}
          <div className="info">
            <span className="info-1">{userDetails?.username || "No Name"}</span>
            <span className="info-2">{userDetails?.email || "No Email"}</span>
          </div>

          {/* Contact Info */}
          <div className="content-1">
            <FaPhone className="icon" />{" "}
            {userDetails?.phone_number || "No Phone"}
          </div>

          {/* Dashboard Section */}
          <div className="content-2">
            <Dashboard error={error} busDetails={busDetails} userId={userId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
