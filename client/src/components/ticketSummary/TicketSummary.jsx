import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Ticketsummary.css";
import axios from "axios";
import authen from "../../authent";
import LoadingPage from "../loadingPage/loadingPage";
const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const TicketSummary = () => {
  authen();
  const [busDetails, setBusDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

  const navigate = useNavigate();
  const { selectedSeats } = useParams();
  const seats = selectedSeats.split(",");
  console.log(typeof selectedSeats);
  // const seatNumber = parseInt(selectedSeats) + 1;

  useEffect(() => {
    const fetchBusDetails = async () => {
      try {
        const req_user = await axios.get(`${backEndUrl}/auth`, {
          withCredentials: true,
        });
        console.log(req_user);
        setUserId(req_user.data.userId);
        // const response = await axios.get(`http://localhost:${port}/seatselection/${busId}`);
        const response = await axios.get(
          `${backEndUrl}/seatselection/${req_user.data.busId}`
        );
        console.log(response);
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
      const req_user = await axios.get(`${backEndUrl}/auth`, {
        withCredentials: true,
      });
      console.log(req_user);
      setUserId(req_user.data.userId);
      const userId = req_user.data.userId;
      const res = await axios.get(`${backEndUrl}/user/profile/${userId}`);
      setUserDetails(res.data);
      console.log("users", res.data);
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
      {/* <h1>Ticket Summary</h1> */}
    {loading ? (<LoadingPage/>):(      <div className="summary-container">
        <div className="section">
          <h3 className="details-title">Passenger Information</h3>
          <div className="details">
            <p>
              <strong>Name</strong> {userDetails.name}
            </p>
            <p>
              <strong>Email</strong> {userDetails.email}
            </p>
            <p>
              <strong>Phone</strong> {userDetails.phoneNumber}
            </p>
          </div>
        </div>

        <div className="section">
          <h3 className="details-title">Bus Details</h3>
          <div className="details">
            <p>
              <strong>Date</strong>
              {busDetails.schedule}
            </p>
            <p>
              <strong>Departure Time</strong> {busDetails.time.departureTime}
            </p>
            <p>
              <strong>Pickup</strong> {busDetails.location.pickupLocation}
            </p>
            <p>
              <strong>Arrival</strong> {busDetails.location.arrivalLocation}
            </p>
          </div>
        </div>

        <div className="section">
          <h3 className="details-title">Seats Selected</h3>
          <div className="details">
            <p>{seats.map((index) => parseInt(index) + 1).join(", ")} </p>
          </div>
        </div>

        <div className="section">
          <h3 className="details-title">Total Price</h3>
          <div className="details">
            <p>{busDetails.price * seats.length}</p>
          </div>
        </div>
      </div>)}

    </div>
  );
};

export default TicketSummary;
