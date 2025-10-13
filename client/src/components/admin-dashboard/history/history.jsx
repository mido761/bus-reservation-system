import React, { useState } from "react";
import axios from 'axios';
// import { format } from 'date-fns';
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

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    setTrips(null);
    try {
      const history = await axios.post(
        `${backEndUrl}/bookingHistory/admin`,
        { schedule: search }
      );
      setTrips(history.data.bookingHistory);
    } catch (err) {
      console.error("Error Fetching user history!", err);
      setTrips([]);
    } finally {
      setLoading(false);
    }
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
        <div className="mytrips-list">
          {trips.map((trip, idx) => (
            <div className="mytrips-card" key={trip._id || trip.id || idx}>
              <div className="mytrips-card-header">
                <span className="mytrips-date-professional">
                  {(() => {
                    const rawDate = trip.schedule || trip.date || trip.createdAt;
                    if (!rawDate) return 'Trip';
                    return format(new Date(rawDate), 'dd/MM/yyyy');
                  })()}
                </span>
                <span className="mytrips-reserved-at">
                  Reserved at: {(() => {
                    const reservedDate = trip.createdAt || trip.date;
                    if (!reservedDate) return '-';
                    return format(new Date(reservedDate), 'dd/MM/yyyy, hh:mm a');
                  })()}
                </span>
              </div>
              <hr className="mytrips-divider" />
              <div className="mytrips-card-route">
                <div className="mytrips-route-line">
                  <span className="mytrips-dot green"></span>
                  <span>{trip.from}</span>
                </div>
                <div className="mytrips-route-line">
                  <span className="mytrips-dot orange"></span>
                  <span>{trip.to}</span>
                </div>
              </div>
              <div className="mytrips-card-extra">Booked By: {trip.bookedBy?.name} ({trip.bookedBy?.email})</div>
              {trip.seat && (
                <div className="mytrips-card-extra">Seat: {trip.seat}</div>
              )}
              {trip.status && (
                <div className="mytrips-card-extra">Status: {trip.status}</div>
              )}
              {trip.route && (
                <div className="mytrips-card-extra">Route: {trip.route}</div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="history-tip">Search for a user to view their trips.</div>
      )}
    </div>
  );
};

export default History;
