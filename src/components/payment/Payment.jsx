import React, { useState } from 'react';
import { useNavigate , useParams} from 'react-router-dom';
import './Payment.css';
import axios from 'axios';
import authen from '../../authent';
const port = 3001

const Payment = () => {
  authen()
  const { selectedSeats } = useParams();
  const navigate = useNavigate();
  const [paymentDetails, setPaymentDetails] = useState({
    paymentMethod: 'visa', // Default to Visa
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  });
  
  const [paymentSuccess, setPaymentSuccess] = useState(false); // New state for payment success
  const [confirmationMessage, setConfirmationMessage] = useState(""); // New state for the confirmation message

  // Function to format card number
  const formatCardNumber = (value) => {
    return value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').slice(0, 19); // Max 16 digits with spaces
  };

  // Function to format expiry date
  const formatExpiryDate = (value) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/g, '$1/').slice(0, 5); // Max 4 digits in MM/YY format
  };

  // Function to strictly enforce 3 numeric characters for CVV
  const formatCvc = (value) => {
    return value.replace(/\D/g, '').slice(0, 3); // Allow only digits, max length of 3
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    // Simulate successful payment and confirmation message
    setPaymentSuccess(true);
    
    // Set a confirmation message with trip details
    setConfirmationMessage(`
      Your payment was made via ${paymentDetails.paymentMethod === 'visa' ? 'Visa' : 'Cash'}.
    `);

    // Simulate redirect to payment success page (e.g., navigate to a success page)
    setTimeout(async() => {

      //request form auth end the user id and bus id
      const req_user = await axios.get(`http://localhost:${port}/auth`, { withCredentials: true }); 
      // req_user.data.busId = busId
      console.log(req_user)
      const userId = req_user.data.userId; // Ensure the token contains the user ID
      const busId = req_user.data.busId;
      console.log("Bus ID: ", busId);//bus Id from authentiction
      // const Index =
      console.log(selectedSeats);
       
      // Send the seat reservation request to the backend
      const response = await axios.post(
        `http://localhost:${port}/seatselection/${busId}`,
        { selectedSeats, userId },
        { withCredentials: true }
      );
      // updata the user booked buses
      // const res_busId = await axios.post(`http://localhost:${port}/payment`,
      //   { userId,busId},
      //   { withCredentials: true }
      // )
      console.log(selectedSeats)
      navigate(`/payment-success/${selectedSeats}`); // Redirect to payment success page
    }); // Wait 2 seconds before navigating
  };

  return (
    <div className="payment-container">
      <h1>Complete Your Payment</h1>
      <form className="payment-form" onSubmit={handlePaymentSubmit}>
        {/* Payment Method Selection */}
        <div className="payment-method">
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="visa"
              checked={paymentDetails.paymentMethod === 'visa'}
              onChange={(e) => setPaymentDetails({ ...paymentDetails, paymentMethod: e.target.value })}
            />
            Visa
          </label>
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="cash"
              checked={paymentDetails.paymentMethod === 'cash'}
              onChange={(e) => setPaymentDetails({ ...paymentDetails, paymentMethod: e.target.value })}
            />
            Cash
          </label>
        </div>

        {/* Visa Payment Form (only shown if Visa is selected) */}
        {paymentDetails.paymentMethod === 'visa' && (
          <>
            <input
              type="text"
              placeholder="Card Number"
              value={paymentDetails.cardNumber}
              onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: formatCardNumber(e.target.value) })}
              required
            />
            <input
              type="text"
              placeholder="Expiry Date (MM/YY)"
              value={paymentDetails.cardExpiry}
              onChange={(e) => setPaymentDetails({ ...paymentDetails, cardExpiry: formatExpiryDate(e.target.value) })}
              required
            />
            <input
              type="text"
              placeholder="CVV"
              value={paymentDetails.cardCvv}
              onChange={(e) => setPaymentDetails({ ...paymentDetails, cardCvv: formatCvc(e.target.value) })}
              required
              maxLength="3" // Limit to 3 characters
              pattern="\d{3}" // Regex to validate exactly 3 digits
              title="CVV must be exactly 3 numeric characters"
            />
          </>
        )}

        <button type="submit" className="cta-button">Pay Now</button>
      </form>

      {/* Payment Success and Confirmation Message */}
      {paymentSuccess && (
        <div className="confirmation-message">
          <p>{confirmationMessage}</p>
        </div>
      )}
    </div>
  );
};

export default Payment;
