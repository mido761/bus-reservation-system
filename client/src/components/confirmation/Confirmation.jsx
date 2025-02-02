import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Confirmation.css';

const Confirmation = ({ selectedBus, selectedSeats }) => {
  const navigate = useNavigate();

  // Check if selectedBus is null or undefined
  if (!selectedBus) {
    return <div className="error">Error: Bus details are missing!</div>;
  }

  const handleProceedToPayment = () => {
    navigate('/payment');
  };

  return (
    <div className="confirmation-page">
      <header className="header">
        <h1>Booking Confirmation</h1>
      </header>

      <div className="confirmation-details">
        <h3>Bus Details</h3>
        <p><strong>Bus Name:</strong> {selectedBus.name}</p>
        <p><strong>Pickup:</strong> {selectedBus.pickup}</p>
        <p><strong>Arrival:</strong> {selectedBus.arrival}</p>
        <p><strong>Time:</strong> {selectedBus.time}</p>
        <p><strong>Date:</strong> {selectedBus.date}</p>
        <p><strong>Price:</strong> {selectedBus.price}</p>

        <h3>Selected Seats</h3>
        {selectedSeats.length > 0 ? (
          <ul>
            {selectedSeats.map((seat, index) => (
              <li key={index}>Seat {seat}</li>
            ))}
          </ul>
        ) : (
          <p>No seats selected.</p>
        )}

        <div className="confirmation-footer">
          <button onClick={handleProceedToPayment} className="proceed-button">Proceed to Payment</button>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;
