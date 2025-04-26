import React, { useState, useEffect } from "react";
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
  const [userDetails, setUserDetails] = useState({});

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const req_user = await axios.get(`${backEndUrl}/auth`, {
          withCredentials: true,
        });
        setUserId(req_user.data.userId);

        const busId = req_user.data.busId;
        if (busId) {
          const response = await axios.get(
            `${backEndUrl}/seatselection/${busId}`
          );
          if (response.data) {
            setBusDetails(response.data);
          } else {
            setError("No bus details found.");
          }
        } else {
          setError("No busId associated with this user.");
        }
      } catch (err) {
        console.error("Error fetching bus details:", err);
        setError("Failed to fetch bus details.");
      }
    };

    const fetchUsers = async () => {
      let busIds = [];
      try {
        const req_user = await axios.get(`${backEndUrl}/auth`, {
          withCredentials: true,
        });
        setUserId(req_user.data.userId);
        const userId = req_user.data.userId;
    
        const res = await axios.get(`${backEndUrl}/user/profile/${userId}`);
        setUserDetails(res.data);
        const userDetails = res.data;
        busIds = userDetails.bookedBuses.buses;
    
        const response = await axios.get(`${backEndUrl}/buses/userBuses`, {
          params: { ids: busIds?.length ? busIds.join(",") : [] },
        });
        const buses = response.data;
    
        setBusDetails((prevBuses) =>
          Array.isArray(prevBuses) ? [...prevBuses, ...buses] : [...buses]
        );
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to fetch bus details.");
        if (busIds.length > 0) {
          const response = await axios.get(`${backEndUrl}/buses/userBuses`, {
            params: { ids: busIds.join(",") },
          });
          setBusDetails(response.data);
        } else {
          setError("No booked buses found.");
        }
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      }
    };
    

    fetchUserData();
    fetchUsers();
  }, []);

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="profile-container">
      <div className="card">
        {/* Avatar (you can customize it later) */}
        <label className="avatar"></label>

        {/* User Info */}
        <label className="info">
          <span className="info-1">{userDetails?.name}</span>
          <span className="info-2">{userDetails?.email}</span>
        </label>

        {/* Contact Info */}
        <div className="content-1">
          <FaPhone className="icon" /> {userDetails?.phoneNumber}
        </div>

        {/* Dashboard Section */}
        <div className="content-2">
          <Dashboard error={error} busDetails={busDetails} userId={userId} />
        </div>
      </div>
    </div>
  );
};

export default UserProfile;