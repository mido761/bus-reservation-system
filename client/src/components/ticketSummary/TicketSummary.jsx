import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Ticketsummary.css";
import axios from "axios";
import LoadingPage from "../loadingPage/loadingPage";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const TicketSummary = () => {
  const [busDetails, setBusDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

  const navigate = useNavigate();
  const { selectedSeats } = useParams();
  const seats = selectedSeats?.split(",") || [];

  useEffect(() => {
    const fetchBusDetails = async () => {
      try {
        const req_user = await axios.get(`${backEndUrl}/auth`, {
          withCredentials: true,
        });
        setUserId(req_user.data.userId);

        const response = await axios.get(
          `${backEndUrl}/seatselection/${req_user.data.busId}`
        );
        setBusDetails(response.data);
      } catch (err) {
        console.error("Error fetching bus details:", err);
        setError("Failed to fetch bus details.");
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      }
    };

    const fetchUsers = async () => {
      try {
        const req_user = await axios.get(`${backEndUrl}/auth`, {
          withCredentials: true,
        });
        setUserId(req_user.data.userId);

        const res = await axios.get(`${backEndUrl}/user/profile/${req_user.data.userId}`);
        setUserDetails(res.data);
      } catch (err) {
        console.error("Error fetching user details:", err);
      }
    };

    fetchUsers();
    fetchBusDetails();
  }, []);

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="ticket-summary-page">
      <div className="ticket-summary-header">
        <h1></h1>
      </div>

      <div className="summary-container">
        {/* Passenger Information */}
        <div className="section">
          <h3 className="details-title">Passenger Information</h3>
          <div className="details">
            <p className="name">
              <strong>Name:</strong> {userDetails?.name}
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="section">
          <h3 className="details-title">Contact Information</h3>
          <div className="details">
            <p>
              <strong>Email:</strong> {userDetails?.email}
            </p>
            <p>
              <strong>Phone:</strong> {userDetails?.phoneNumber}
            </p>
          </div>
        </div>

        {/* Bus Details */}
        <div className="section">
          <h3 className="details-title">Bus Details</h3>
          <div className="details">
            <p>
              <strong>Date:</strong> {busDetails?.schedule}
            </p>
            <p>
              <strong>Departure Time:</strong> {busDetails?.time?.departureTime}
            </p>
            <p>
              <strong>Pickup:</strong> {busDetails?.location?.pickupLocation}
            </p>
            <p>
              <strong>Arrival:</strong> {busDetails?.location?.arrivalLocation}
            </p>
          </div>
        </div>

        {/* Selected Seats */}
        <div className="section">
          <h3 className="details-title">Seats Selected</h3>
          <div className="details">
            <p>{seats.map((index) => index < 7
                    ? index - 1
                    : index > 7 && index < 10
                    ? index - 2
                    : index > 10 && index < 14
                    ? index - 3
                    : index - 4).join(", ")}</p>
          </div>
        </div>

        {/* Total Price */}
        <div className="section">
          <h3 className="details-title">Total Price</h3>
          <div className="details">
            <p>{busDetails?.price * seats.length}</p>
          </div>
        </div>

        {/* Confirmation Message */}
        <div className="confirmation-message">
          Please check your profile to confirm that your seat is booked.
        </div>
      </div>
    </div>
  );
};

export default TicketSummary;
