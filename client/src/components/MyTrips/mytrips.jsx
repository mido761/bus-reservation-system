import React, { useEffect, useState } from "react";
import "./mytrips.css";


const MyTrips = () => {
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    // Simulate loading and fetching data
    setTimeout(() => {
      setTrips(dummyTrips); // Replace with [] to test 'no trips' message
      setLoading(false);
    }, 1200);
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
      )}
    </div>
  );
};

export default MyTrips;
