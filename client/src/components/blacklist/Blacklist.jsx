import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Blacklist.css";
import LoadingComponent from "../loadingComponent/loadingComponent";
import LoadingScreen from "../loadingScreen/loadingScreen";
import LoadingPage from "../loadingPage/loadingPage";
import Overlay from "../overlayScreen/overlay";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const BlacklistPage = () => {
  const [blacklist, setBlacklist] = useState([]);
  const [userInfo, setUserInfo] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null); // Store ID of item being deleted
  const [deleteSuccess, setDeleteSuccess] = useState(null);

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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlackList();
  }, []);

  // Handle delete blacklist entry
  const handleDeleteBlacklist = async (blacklistId) => {
    setDeleteLoading(blacklistId); // Set which item is being deleted
    try {
      await axios.delete(`${backEndUrl}/blacklist/${blacklistId}`);
      
      // Remove the deleted entry from the state
      setBlacklist(blacklist.filter(entry => entry._id !== blacklistId));
      
      // Show success message briefly
      setDeleteSuccess("User removed from blacklist successfully");
      setTimeout(() => {
        setDeleteSuccess(null);
      }, 3000);
    } catch (error) {
      console.error("Error deleting blacklist entry:", error);
      setError("Failed to remove user from blacklist.");
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setDeleteLoading(null); // Reset loading state
    }
  };

  // Create proper map of users by ID
  const createUserMap = () => {
    const map = {};
    userInfo.forEach((user, index) => {
      if (user && user._id) {
        map[user._id] = user;
      }
    });
    return map;
  };

  const userMap = createUserMap();

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="black-list-page">
      <div className="black-list-container">
        <h1>Blacklisted Users</h1>
        
        {/* Success or error notifications */}
        {deleteSuccess && <p className="success-message">{deleteSuccess}</p>}
        {error && <p className="error-message">{error}</p>}
        
        <table className="black-list-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Reason</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {blacklist.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-data">No blacklisted users found</td>
              </tr>
            ) : (
              blacklist.map((entry, index) => {
                const userId = entry.userId;
                const user = userMap[userId];
                return (
                  <tr key={entry._id || index}>
                    <td>{index + 1}</td>
                    <td>{user?.name || "N/A"}</td>
                    <td>{user?.phoneNumber || "N/A"}</td>
                    <td>{entry.reason || "N/A"}</td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteBlacklist(entry._id)}
                        disabled={deleteLoading === entry._id}
                      >
                        {deleteLoading === entry._id ? "Removing..." : "Remove"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {/* No global overlay needed as we're showing loading state on individual buttons */}
    </div>
  );
};

export default BlacklistPage;