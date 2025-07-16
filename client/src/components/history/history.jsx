import React, { useState } from "react";
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

const History = () => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [trips, setTrips] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    setTrips(null);
    // Simulate API call
    setTimeout(() => {
      setTrips(dummyUsers[search.trim().toLowerCase()] || []);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="history-container">
      <h2>User Trips</h2>
      <form className="history-search-form" onSubmit={handleSearch}>
        <input
          type="text"
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
              <th>Date</th>
              <th>From</th>
              <th>To</th>
              <th>Seat</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((trip) => (
              <tr key={trip.id}>
                <td>{trip.date}</td>
                <td>{trip.from}</td>
                <td>{trip.to}</td>
                <td>{trip.seat}</td>
                <td>{trip.status}</td>
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
