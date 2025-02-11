import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Payment.css";
import axios from "axios";
import authen from "../../authent";
import Overlay from "../overlayScreen/overlay";
import PaymentSuccess from "../paymentSuccess/PaymentSuccess";
const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const Payment = () => {
  authen();
  const { selectedSeats } = useParams();
  const navigate = useNavigate();
  const [paymentDetails, setPaymentDetails] = useState({
    paymentMethod: "visa", // Default to Visa
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
  });

  // overlay screen
  const [alertFlag, setAlertFlag] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [paymentSuccess, setPaymentSuccess] = useState(false); // New state for payment success
  const [confirmationMessage, setConfirmationMessage] = useState(""); // New state for the confirmation message

  // Function to format card number
  const formatCardNumber = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{4})(?=\d)/g, "$1 ")
      .slice(0, 19); // Max 16 digits with spaces
  };

  // Function to format expiry date
  const formatExpiryDate = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(?=\d)/g, "$1/")
      .slice(0, 5); // Max 4 digits in MM/YY format
  };

  // Function to strictly enforce 3 numeric characters for CVV
  const formatCvc = (value) => {
    return value.replace(/\D/g, "").slice(0, 3); // Allow only digits, max length of 3
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setPaymentSuccess(true);

    setConfirmationMessage(`
      Your payment was made via ${
        paymentDetails.paymentMethod === "visa" ? "Visa" : "Cash"
      }.
    `);
    try {
      const req_user = await axios.get(`${backEndUrl}/auth`, {
        withCredentials: true,
      });

      const userId = req_user.data.userId;
      const busId = req_user.data.busId;

      console.log("User ID:", userId, "Bus ID:", busId);
      console.log("Selected Seats:", selectedSeats);

      const response = await axios.post(
        `${backEndUrl}/seatselection/${busId}`,
        { selectedSeats, userId },
        { withCredentials: true }
      );
      setAlertMessage(
        <div className="payment-success-container">
          <h1>Successful Payment</h1>
          <p>
            Thank you for booking with us. <br /> <br />
            You will receive a confirmation message shortly.
          </p>
        </div>
      );
      setAlertFlag(true);
      setTimeout(() => {
        setAlertFlag(false);
        navigate(`/ticket-summary/${selectedSeats}`);
      }, 2000);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setAlertMessage(
          <div className="payment-success-container">
            <h1>Payment Failed</h1>
            <p>
              The selected seats are already booked. <br /> <br />
              Please try again with different seats.
            </p>
          </div>
        );
        setAlertFlag(true);
        setTimeout(() =>{ setAlertFlag(false); navigate(-1)}, 2000);
      } else {
        console.error("An error occurred:", error);
      }
    }
  };

  return (
    <div
      className={`payment-container ${
        paymentDetails.paymentMethod === "cash" ? "cash" : ""
      }`}
    >
      <div className="payment-box-container">
        <h1>Complete Your Payment</h1>
        <form className="payment-form" onSubmit={handlePaymentSubmit}>
          {/* Payment Method Selection */}
          <div className="payment-method">
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="visa"
                checked={paymentDetails.paymentMethod === "visa"}
                onChange={(e) =>
                  setPaymentDetails({
                    ...paymentDetails,
                    paymentMethod: e.target.value,
                  })
                }
              />
              Visa
            </label>
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="cash"
                checked={paymentDetails.paymentMethod === "cash"}
                onChange={(e) =>
                  setPaymentDetails({
                    ...paymentDetails,
                    paymentMethod: e.target.value,
                  })
                }
              />
              Cash
            </label>
          </div>

          {/* Visa Payment Form (only shown if Visa is selected) */}
          {paymentDetails.paymentMethod === "visa" && (
            <>
              <input
                type="text"
                placeholder="Card Number"
                value={paymentDetails.cardNumber}
                onChange={(e) =>
                  setPaymentDetails({
                    ...paymentDetails,
                    cardNumber: formatCardNumber(e.target.value),
                  })
                }
                required
              />
              <input
                type="text"
                placeholder="Expiry Date (MM/YY)"
                value={paymentDetails.cardExpiry}
                onChange={(e) =>
                  setPaymentDetails({
                    ...paymentDetails,
                    cardExpiry: formatExpiryDate(e.target.value),
                  })
                }
                required
              />
              <input
                type="text"
                placeholder="CVV"
                value={paymentDetails.cardCvv}
                onChange={(e) =>
                  setPaymentDetails({
                    ...paymentDetails,
                    cardCvv: formatCvc(e.target.value),
                  })
                }
                required
                maxLength="3" // Limit to 3 characters
                pattern="\d{3}" // Regex to validate exactly 3 digits
                title="CVV must be exactly 3 numeric characters"
              />
            </>
          )}

          <button type="submit" className="cta-button">
            Pay Now
          </button>
        </form>

        {alertFlag && (
          <Overlay
            alertFlag={alertFlag}
            alertMessage={alertMessage}
            setAlertFlag={setAlertFlag}
          />
        )}
      </div>
    </div>
  );
};

export default Payment;
