import React, { useEffect, useState } from "react";
import axios from 'axios';
import "./mytrips.css";
const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const MyTrips = () => {
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState([]);
  const [userId, setUserId] = useState("");

  const getUserTrips = async () => {
    console.log("fetching history...")
    try {
      const req_user = await axios.get(`${backEndUrl}/auth`, {
        withCredentials: true,
      });
      const user_id = req_user.data.userId
      setUserId(req_user.data.userId);

      const user_history = await axios.get(
        `${backEndUrl}/bookingHistory/user/${user_id}`
      );
      setTrips(user_history.data.bookingHistory);

    } catch (err) {
      console.error("Error Fetching user history!", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserTrips();
  }, []);

  return (
    <div className="mytrips-container">
      <h2>My Trips</h2>
      {loading ? (
        <div className="mytrips-loading">Loading your trips...</div>
      ) : trips.length === 0 ? (
        <div className="mytrips-empty">You have no trip history yet.</div>
      ) : (
        <table className="mytrips-table">
          <thead>
            <tr>
              <th>schedule</th>
              <th>From</th>
              <th>To</th>
              <th>route</th>
              <th>createdAt</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((trip) => (
              <tr key={trip.id}>
                <td>{trip.schedule}</td>
                <td>{trip.from}</td>
                <td>{trip.to}</td>
                <td>{trip.route}</td>
                <td>{trip.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyTrips;
