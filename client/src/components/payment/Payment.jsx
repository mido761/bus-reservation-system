import React, { useState } from "react";
import PaymentType from "./paymenttype";
import PaymentValid from "./paymentvalid";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const Payment = () => {
  const { selectedSeats } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { booking, trip, route, payment } = location.state || {};
  const [paymentDetails, setPaymentDetails] = useState({
    paymentMethod: "cash", // Default to Visa
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
    capture: "Capture (Authorize + Capture)",
  };

  // Step 1: User clicks Book Now, show confirmation modal
  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setAlertMessage(
      <PaymentValid
        paymentMethodLabel={paymentMethodLabels[paymentDetails.paymentMethod]}
        onConfirm={proceedPayment}
        onClose={cancelConfirm}
      />
    );
    setAlertFlag(true);
    setShowConfirm(true);
  };

  // Proceed with payment after confirmation
  // Step 2: User confirms, button loads, toastify shows backend message, redirect to Paymob
  const proceedPayment = async (e) => {
    if (e) e.preventDefault();
    setShowConfirm(false);
    setAlertFlag(false);
    setIsLoading(true);
    try {
      const res = await axios.post(
        `${backEndUrl}/payment/stand-alone-payment`,
        {
          booking: booking,
          trip: trip,
          route: route,
        },
        { withCredentials: true }
      );
      // Show success toast immediately with backend message
      toast.success("Redirecting to payment page", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setIsLoading(false);
      window.location.href = res.data.PAYMENT_URL;
    } catch (error) {
      setIsLoading(false);
      toast.error((error.response?.data?.message || "An error occurred."), {
        position: "top-center",
        autoClose: 3500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const cancelConfirm = (e) => {
    if (e) e.preventDefault();
    setShowConfirm(false);
    setAlertFlag(false);
    setPendingEvent(null);
  };

  return (
    <div className="flex items-center justify-center m-auto">
      <Card className="w-full max-w-lg mx-auto p-2">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Confirm Your Booking</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handlePaymentSubmit}>
            <PaymentType
              paymentDetails={paymentDetails}
              setPaymentDetails={setPaymentDetails}
              setAlertMessage={setAlertMessage}
              setAlertFlag={setAlertFlag}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Processing..." : "Book Now"}
            </Button>
          </form>
          {isLoading && <div className="text-center mt-4">Processing payment...</div>}
          {/* Confirmation modal for payment method */}
          {alertFlag && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
              {alertMessage}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Payment;
