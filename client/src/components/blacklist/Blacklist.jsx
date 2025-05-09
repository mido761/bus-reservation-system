import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Blacklist.css";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const BlacklistPage = () => {
  const [blacklist, setBlacklist] = useState([]);
  const [userInfo, setUserInfo] = useState([]);
  const [error, setError] = useState(null);

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
    }
  };

  useEffect(() => {
    fetchBlackList();
  }, []);

  const handleRemoveFromBlackList = async (id) => {
    try {
      await axios.get(`${backEndUrl}/auth`, { withCredentials: true }); // Optional: for authorization

      await axios.delete(`${backEndUrl}/blacklist/${id}`);

      // Refresh list after removal
      fetchBlackList();
    } catch (error) {
      console.error("Error removing from blacklist:", error);
      setError("Failed to remove user from blacklist.");
    }
  };

  const userMap = userInfo.reduce((map, user) => {
    map[user._id] = user;
    return map;
  }, {});

  return (
    <div className="container">
      <h1>Blacklisted Users</h1>
      {error && <p className="error">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>User ID</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Reason</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {blacklist.map((entry, index) => {
            const user = userMap[index];
            return (
              <tr key={index}>
                <td>{index}</td>
                <td>{user?.name || "N/A"}</td>
                <td>{user?.phoneNumber || "N/A"}</td>
                <td>{entry.reason || "N/A"}</td>
                <td>
                  <button
                    className="remove-button"
                    onClick={() => handleRemoveFromBlackList(entry._id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default BlacklistPage;
