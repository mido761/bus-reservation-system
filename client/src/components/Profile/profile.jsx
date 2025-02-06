import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import authen from '../../authent';
import axios from "axios";
import "./UserProfile.css";
import Dashboard from "../dashboard/Dashboard";
import Navbar from "../navbar/nav";
import Footer from "../footer/footer";
const backEndUrl = import.meta.env.VITE_BACK_END_URL

const UserProfile = () => {
  authen();

  const [busDetails, setBusDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBusDetails = async () => {
      try {
        const req_user = await axios.get(`${backEndUrl}/auth`, { withCredentials: true });
        setUserId(req_user.data.userId);

        // Check if busId exists in the user data
        const busId = req_user.data.busId;
        if (busId) {
          const response = await axios.get(`${backEndUrl}/seatselection/${busId}`);
          if (response.data) {
            setBusDetails(response.data);
          } else {
            setError("No bus details found.");
          }
        } else {
          setError("No busId associated with this user.");
        }
      } catch (err) {
        console.error('Error fetching bus details:', err);
        setError('Failed to fetch bus details.');
      } finally {
        setLoading(false);
      }
    };

    const fetchUsers = async () => {
      try {
        const req_user = await axios.get(`${backEndUrl}/auth`, { withCredentials: true });
        setUserId(req_user.data.userId);
        const userId = req_user.data.userId;
        const res = await axios.get(`${backEndUrl}/user/profile/${userId}`);
        setUserDetails(res.data);
      } catch (err) {
        console.error("Error fetching user details:", err);
        setError("Failed to fetch user details.");
      }
    };

    fetchUsers();
    fetchBusDetails();
  }, []);

  if (loading) {
    return <p>Loading bus details...</p>;
  }

  return (
    <div className="profile-container">
    <div className="user-profile">
        <div className="avatar"></div>
        <h1>{userDetails?.name}</h1>
        <p>{userDetails?.email}</p>
        <p>{userDetails?.phoneNumber}</p>
      </div>
      <Dashboard busDetails={busDetails} error={error} /> {/* Pass error to Dashboard */}
    </div>

  );
};

export default UserProfile;
