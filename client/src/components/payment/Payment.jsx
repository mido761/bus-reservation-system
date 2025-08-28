import React, { useState } from "react";
import PaymentType from "./paymenttype";
import PaymentValid from "./paymentvalid";
import { useNavigate, useParams ,useLocation} from "react-router-dom";
import "./Payment.css";
import axios from "axios";
import LoadingScreen from "../loadingScreen/loadingScreen";
import Overlay from "../overlayScreen/overlay";
const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const Payment = () => {
  const { selectedSeats } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { booking,trip,route,selectedStop,payment} = location.state || {};
  const [paymentDetails, setPaymentDetails] = useState({
    paymentMethod:"cash"// Default to Visa
  });

  // overlay screen
  const [alertFlag, setAlertFlag] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const [paymentSuccess, setPaymentSuccess] = useState(false); // New state for payment success
  const [confirmationMessage, setConfirmationMessage] = useState(""); // New state for the confirmation message


  // if (isProcessing) return; // Prevent multiple submissions
  // setIsProcessing(true);

  // Function to format card number
  // const formatCardNumber = (value) => {
  //   return value
  //     .replace(/\D/g, "")
  //     .replace(/(\d{4})(?=\d)/g, "$1 ")
  //     .slice(0, 19); // Max 16 digits with spaces
  // };

  // // Function to format expiry date
  // const formatExpiryDate = (value) => {
  //   return value
  //     .replace(/\D/g, "")
  //     .replace(/(\d{2})(?=\d)/g, "$1/")
  //     .slice(0, 5); // Max 4 digits in MM/YY format
  // };

  // // Function to strictly enforce 3 numeric characters for CVV
  // const formatCvc = (value) => {
  //   return value.replace(/\D/g, "").slice(0, 3); // Allow only digits, max length of 3
  // };

  // New: Confirm payment method before proceeding
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingEvent, setPendingEvent] = useState(null);

  const paymentMethodLabels = {
    cash: "Cash",
    standalone: "Standalone (Authorize Only)",
    capture: "Capture (Authorize + Capture)"
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setPendingEvent(e);
    setAlertMessage(
      <div className="policy-popup">
        <h2>Confirm Payment Method</h2>
        <p>You have selected: <b>{paymentMethodLabels[paymentDetails.paymentMethod]}</b></p>
        <div className="popup-btn-row">
          <button className="popup-btn confirm" onClick={proceedPayment}>Confirm</button>
          <button className="popup-btn cancel" onClick={cancelConfirm}>Cancel</button>
        </div>
      </div>
    );
    setAlertFlag(true);
    setShowConfirm(true);
  };

  // Proceed with payment after confirmation
  const proceedPayment = async (e) => {
    if (e) e.preventDefault();
    setShowConfirm(false);
    setAlertFlag(false);
    setPaymentSuccess(true);
    setIsLoading(true);
    try {
      // const req_user = await axios.get(`${backEndUrl}/auth`, {
      //   withCredentials: true,
      // });

      // const userId = req_user.data.userId;
      // const busId = req_user.data.busId;
      console.log(booking)
      console.log(payment)
      console.log(trip)

      // if(e === "standalone"){
      const res = await axios.post(
        `${backEndUrl}/payment/stand-alone-payment`,
        {booking:booking,
          payment:payment,
          trip:trip,
          route:route,
          stop:selectedStop},
          {withCredentials: true}
      );
       console.log(res.data)
      // }
   

      setTimeout(() => {
        setIsLoading(false);
        setAlertMessage(
          <div className="payment-success-container">
            <h1>✅ Successful Payment</h1>
            <p>
              Thank you for booking with us. <br /> <br />
              You will receive a confirmation message shortly.
            </p>
          </div>
        );
        setAlertFlag(true);
      }, 1000);

      setTimeout(() => {
        setAlertFlag(false);
        // navigate(res.data.PAYMENT_URL);
        window.location.href = res.data.PAYMENT_URL;
      }, 2200);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setTimeout(() => {
          setIsLoading(false);
          setAlertMessage(
            <div className="payment-success-container">
              <h1>⚠️ Payment Failed</h1>
              <p>
                {(error.response.data.message)}
              </p>
            </div>
          );
          setAlertFlag(true);
        }, 1000);
      } else {
        console.error("An error occurred:", error);
        setTimeout(() => {
          setIsLoading(false);
          setAlertMessage(
            <div className="payment-success-container">
              <h1>⚠️ Payment Failed</h1>
              <p>
              An error occurred while booking, please try again.
              </p>
            </div>
          );
          setAlertFlag(true);
        }, 1000);
      }
    }
  };

  const cancelConfirm = (e) => {
    if (e) e.preventDefault();
    setShowConfirm(false);
    setAlertFlag(false);
    setPendingEvent(null);
  };

  return (
    <div
      className={`payment-container ${
        paymentDetails.paymentMethod === "cash" ? "cash" : ""
      }`}
    >
      <div className="payment-box-container">
        <h1>Confirm Your Booking</h1>
        <form className="payment-form" onSubmit={handlePaymentSubmit}>
          {/* <div className="payment-method">
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
          )} */}

          <PaymentType
            paymentDetails={paymentDetails}
            setPaymentDetails={setPaymentDetails}
            setAlertMessage={setAlertMessage}
            setAlertFlag={setAlertFlag}
          />

          <button type="submit" className="cta-button">
            Book Now
          </button>
        </form>
        {isLoading && <LoadingScreen />}

        {alertFlag && (
          <div className="popup-overlay">
            {typeof alertMessage === "string"
              ? <Overlay alertFlag={alertFlag} alertMessage={alertMessage} setAlertFlag={setAlertFlag} />
              : alertMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;
