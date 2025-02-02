import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './PaymentSuccess.css';
import authen from '../../authent';

const port = 3001

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { selectedSeats } = useParams();
  console.log(selectedSeats)
  authen()

  const handleProceedToTicketSummary = () => {
    navigate(`/ticket-summary/${selectedSeats}`);  // Redirects to the TicketSummary page
  };

  return (
    <div className="payment-success-container">
      <h1>Successful Payment </h1>
      <p>Thank you for booking with us. <br /> <br />You will receive a confirmation message shortly.</p>
      <button onClick={handleProceedToTicketSummary} className="cta-button">
        Proceed to the Ticket Summary
      </button>
    </div>
  );
};

export default PaymentSuccess;
