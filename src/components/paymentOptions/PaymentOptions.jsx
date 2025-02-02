import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentPage.css';

const PaymentPage = () => {
  const navigate = useNavigate();
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');

  const handlePayment = () => {
    // Simulate successful payment and redirect to the success page
    navigate('/payment-success');
  };

  return (
    <div className="payment-page">
      <h1>Payment Information</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="form-group">
          <label htmlFor="name">Cardholder Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="card-number">Card Number</label>
          <input
            type="text"
            id="card-number"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            required
            maxLength="16"
          />
        </div>
        <div className="form-group">
          <label htmlFor="expiry-date">Expiry Date</label>
          <input
            type="month"
            id="expiry-date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="cvv">CVV</label>
          <input
            type="text"
            id="cvv"
            value={cvv}
            onChange={(e) => setCvv(e.target.value)}
            required
            maxLength="3"
          />
        </div>
        <button type="submit" onClick={handlePayment} className="pay-button">
          Proceed to Payment
        </button>
      </form>
    </div>
  );
};

export default PaymentPage;
