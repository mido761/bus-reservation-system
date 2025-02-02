import React, { useState ,useEffect} from 'react';
import { useNavigate , useParams} from 'react-router-dom';
import './Ticketsummary.css';
import axios from 'axios';
import authen from '../../authent';
const port = 3001

const TicketSummary = () => {
  authen()
  const [busDetails, setBusDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);  
  const [userDetails, setUserDetails] = useState(null);

  const navigate = useNavigate();
  const { selectedSeats } = useParams();
  const seats = selectedSeats.split(",")
  console.log(typeof(selectedSeats))
  // const seatNumber = parseInt(selectedSeats) + 1;

  useEffect(() => {
    
    const fetchBusDetails = async () => {
      try {
        const req_user = await axios.get(`http://localhost:${port}/auth`, { withCredentials: true });
        console.log(req_user)
        setUserId(req_user.data.userId)
        // const response = await axios.get(`http://localhost:${port}/seatselection/${busId}`);
        const response = await axios.get(`http://localhost:${port}/seatselection/${req_user.data.busId}`);
        console.log(response)
        setBusDetails(response.data);
      } catch (err) {
        console.error('Error fetching bus details:', err);
        setError('Failed to fetch bus details.');
      } finally {
        setLoading(false);
      }
    };

    const fetchUsers = async () => {
      const req_user = await axios.get(`http://localhost:${port}/auth`, { withCredentials: true });
      console.log(req_user)
      setUserId(req_user.data.userId)
      const userId = req_user.data.userId
      const res = await axios.get(`http://localhost:3001/user/profile/${userId}`);
      setUserDetails(res.data);
      console.log("users", res.data);
    }
    fetchUsers()
    fetchBusDetails();
    
  }, []);

  // Handle redirection to home or another page
  const handleHomeRedirect = () => {
    navigate('/home');
  };
  if (loading) {
    return <p>Loading bus details...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="ticket-summary-page">
      <div className="summary-container">
        <h1>Ticket Summary</h1>
          <h3 className="details-title">Passenger Information</h3>

        <div className="details">
          <p><strong>Name</strong> {userDetails.name}</p>
          <p><strong>Email</strong> {userDetails.email}</p>
          <p><strong>Phone</strong> {userDetails.phoneNumber}</p>
        </div>
          <h3 className="details-title">Bus Details</h3>

        <div className="details">
          <p><strong>Date</strong>{busDetails.schedule}</p>
          <p><strong>Departure Time</strong> {busDetails.time.departureTime}</p>
          <p><strong>Pickup</strong> {busDetails.location.pickupLocation}</p>
          <p><strong>Arrival</strong> {busDetails.location.arrivalLocation}</p>
        </div>
        
        <h3 className="details-title">Seats Selected</h3>
        <div className="details">
          <p>{seats.map((index) => ( parseInt(index) + 1)).join(", ")} </p>
        </div>

        <h3 className="details-title">Total Price</h3>
        <div className="details">
          <p>{busDetails.price * seats.length}</p>
        </div>        


        <button className="cta-button" onClick={handleHomeRedirect}>
          Return to Home
        </button>

        <div className="summary-footer">
          <p>If you need any assistance, feel free to contact us.</p>
        </div>
      </div>
    </div>
  );
};

export default TicketSummary;
