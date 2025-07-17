import React, { useState } from "react";
import axios from 'axios';
import "./history.css";



const WifiLoader = ({ text = "loading" }) => (
  <div className="wifi-loader">
    <svg className="circle-outer" viewBox="0 0 86 86">
      <circle className="back" cx="43" cy="43" r="40"></circle>
      <circle className="front" cx="43" cy="43" r="40"></circle>
    </svg>
    <svg className="circle-middle" viewBox="0 0 60 60">
      <circle className="back" cx="30" cy="30" r="27"></circle>
      <circle className="front" cx="30" cy="30" r="27"></circle>
    </svg>
    <svg className="circle-inner" viewBox="0 0 34 34">
      <circle className="back" cx="17" cy="17" r="14"></circle>
      <circle className="front" cx="17" cy="17" r="14"></circle>
    </svg>
    <div className="text" data-text={text}></div>
  </div>
);
const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const History = () => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [trips, setTrips] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch =  async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("fetching history...")
    try {

      const history = await axios.post(
        `${backEndUrl}/bookingHistory/admin`,
        {schedule: search}
      );
      setTrips(history.data.bookingHistory);

    } catch (err) {
      console.error("Error Fetching user history!", err);
    } finally {
      setLoading(false);
    }
    setSearched(true);
    // setTrips(null);
    // Simulate API call
    setTimeout(() => {

      setLoading(false);
    }, 1200);
  };

  return (
    <div className="history-container">
      <h2>User Trips</h2>
      <form className="history-search-form" onSubmit={handleSearch}>
        <input
          type="date"
          placeholder="Enter user information"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="history-search-input"
        />
        <button type="submit" className="history-search-btn">Search</button>
      </form>
      {loading ? (
        <div className="history-loading">
          <WifiLoader text="searching for user trips" />
        </div>
      ) : searched && (!trips || trips.length === 0) ? (
        <div className="history-empty">No trips found for this user.</div>
      ) : trips && trips.length > 0 ? (
        <table className="history-table">
          <thead>
            <tr>
              <th>bookedByName</th>
              <th>bookedByemail</th>
              <th>schedule</th>
              <th>from</th>
              <th>To</th>
              <th>route</th>
              <th>createdAt</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((trip) => (
              <tr key={trip.id}>
                <td>{trip.bookedBy.name}</td>
                <td>{trip.bookedBy.email}</td>
                <td>{trip.schedule}</td>
                <td>{trip.from}</td>
                <td>{trip.to}</td>
                <td>{trip.route}</td>
                <td>{trip.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="history-tip">Search for a user to view their trips.</div>
      )}
    </div>
  );
};

export default History;
