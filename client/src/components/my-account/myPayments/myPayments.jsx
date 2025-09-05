import React, { useEffect, useState } from "react";
import axios from "axios";
import "./myPayments.css";
import formatDateAndTime from "../../../formatDateAndTime";
const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const MyPayments = () => {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [userId, setUserId] = useState("");

  const getUserPayments = async () => {
    console.log("fetching Payments...");
    try {
      const req_user = await axios.get(`${backEndUrl}/auth`, {
        withCredentials: true,
      });
      const user_id = req_user.data.userId;

      setUserId(req_user.data.userId);

      const user_payments = await axios.get(
        `${backEndUrl}/payment/get-user-payments`,
        { withCredentials: true }
      );

      setPayments(user_payments.data.user_payments);
    } catch (err) {
      console.error("Error Fetching user payments!", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserPayments();
  }, []);

  return (
    <div className="mytrips-container">
      <h2>My Payments</h2>
      {loading ? (
        <div className="mytrips-loading">Loading your payments...</div>
      ) : !Array.isArray(payments) ? (
        <div className="mytrips-empty">You have no payments history yet.</div>
      ) : (
        <div className="mytrips-list">
          {Array.isArray(payments) &&
            payments.map((payment, idx) => (
              <div className="mytrips-card" key={payment.payment_id || idx}>
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
                    {formatDateAndTime(payment.created_at, "dateTime")}
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
                    {payment.amount}
                  </div>
                  <div className="mytrips-route-line">
                    <span className="mytrips-dot orange"></span>
                    {payment.payment_method}
                  </div>
                </div>
    

                <div className="mytrips-card-extra">
                  <strong>Status: </strong>
                  <p
                    style={{
                      color: `${
                        payment.payment_status === "paid"
                          ? "green"
                          : payment.payment_status === "pending"
                          ? "blue"
                          : "red"
                      }`,
                      display: "inline",
                    }}
                  >
                    {payment.payment_status}
                  </p>
                </div>

  
                <div className="mytrips-card-extra">
                  <strong>Last Update: </strong>
                  {formatDateAndTime(payment.updated_at, "dateTime")}
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

export default MyPayments;
