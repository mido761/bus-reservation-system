import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Blacklist.css";
import LoadingComponent from "../loadingComponent/loadingComponent"; // Custom component for loading
import LoadingScreen from "../loadingScreen/loadingScreen"; // Custom component for loading screen
import LoadingPage from "../loadingPage/loadingPage"; // Custom component for full page loading
import Overlay from "../overlayScreen/overlay"; // Custom overlay component

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const BlacklistPage = () => {
  const [blacklist, setBlacklist] = useState([]);
  const [userInfo, setUserInfo] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch blacklist and user info from the backend
  const fetchBlackList = async () => {
    try {
      const response = await axios.get(`${backEndUrl}/blacklist`);
      const blacklistData = response.data.blacklist || [];
      const userData = response.data.userNameNum || [];

      setBlacklist(blacklistData);
      setUserInfo(userData);
    } catch (error) {
      console.error("Error fetching blacklist:", error);
      setError("Failed to load blacklist data.");
    } finally {
      setLoading(false); // Set loading to false after data is fetched
    }
  };

  useEffect(() => {
    fetchBlackList();
  }, []);

  // Map user info by userId for quick lookup
  const userMap = userInfo.reduce((map, user) => {
    map[user._id] = user; // Map each user by their userId (_id)
    return map;
  }, {});

  if (loading) {
    return <LoadingPage />; // Return a loading screen while data is being fetched
  }

  return (
    <div className="container">
      <h1>Blacklisted Users</h1>
      {error && <p className="error">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          {blacklist.map((entry, index) => {
            const user = userMap[entry.userId]; // Use userId to map the correct user
            return (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{user?.name || "N/A"}</td>
                <td>{user?.phoneNumber || "N/A"}</td>
                <td>{entry.reason || "N/A"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default BlacklistPage;
