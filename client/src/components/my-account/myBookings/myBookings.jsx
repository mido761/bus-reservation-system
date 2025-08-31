import { useEffect, useState } from "react";
import axios from "axios";
import "./myBookings.css";
import formatDateAndTime from "../../../formatDateAndTime";
const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const MyTrips = () => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [userId, setUserId] = useState("");

  const getUserBookings = async () => {
    console.log("fetching Bookings...");
    try {
      const req_user = await axios.get(`${backEndUrl}/auth`, {
        withCredentials: true,
      });
      const user_id = req_user.data.userId;

      setUserId(req_user.data.userId);

      const user_bookings = await axios.get(
        `${backEndUrl}/booking/get-user-bookings`,
        { withCredentials: true }
      );

      setBookings(user_bookings.data.userBookings);
    } catch (err) {
      console.error("Error Fetching user history!", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserBookings();
  }, []);

  return (
    <div className="mytrips-container">
      <h2>My Bookings</h2>
      {loading ? (
        <div className="mytrips-loading">Loading your trips...</div>
      ) : !Array.isArray(bookings) ? (
        <div className="mytrips-empty">You have no trip history yet.</div>
      ) : (
        <div className="mytrips-list">
          {Array.isArray(bookings) &&
            bookings.map((booking, idx) => (
              <div className="mytrips-card" key={booking.booking_id || idx}>
                <div className="mytrips-card-header">
                  {/* <span className="mytrips-date-professional">
                    {(() => {
                      const rawDate =
                        trip.schedule ||
                        trip.dateTime ||
                        trip.scheduleTime ||
                        trip.createdAt;
                      if (!rawDate) return "Trip";
                      return format(new Date(rawDate), "dd/MM/yyyy");
                    })()}
                  </span> */}
                  <span className="mytrips-reserved-at">
                    <strong>Trip Date: </strong>
                    {formatDateAndTime(booking.date, "date")}
                    {/* {(() => {
                      const reservedDate = trip.createdAt;
                      if (!reservedDate) return "-";
                      return format(
                        new Date(reservedDate),
                        "dd/MM/yyyy, hh:mm a"
                      );
                    })()} */}
                  </span>
                </div>
                <hr className="mytrips-divider" />
                <div className="mytrips-card-route">
                  <div className="mytrips-route-line">
                    <span className="mytrips-dot green"></span>
                    {booking.source}
                  </div>
                  <div className="mytrips-route-line">
                    <span className="mytrips-dot orange"></span>
                    {booking.destination}
                  </div>
                </div>
                <div className="mytrips-card-extra">
                  <strong>Stop: </strong>
                  {booking.stop_name}
                </div>

                <div className="mytrips-card-extra">
                  <strong>Status: </strong>
                  <p style={{ color: `${booking.status === 'confirmed' ? "green" : "red"}`, display:"inline" }}>{booking.status}</p>
                </div>

                <div className="mytrips-card-extra">
                  <strong>Booked At: </strong>
                  {formatDateAndTime(booking.booked_at, "dateTime")}
                </div>
                <div className="mytrips-card-extra">
                  <strong>Last Update: </strong>
                  {formatDateAndTime(booking.updated_at, "dateTime")}
                </div>
                {/* <div className="mytrips-card-extra">Stop: {trip.stop_name}</div> */}
                {/* <div className="mytrips-card-extra">Price: {trip.price}</div> */}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default MyTrips;
