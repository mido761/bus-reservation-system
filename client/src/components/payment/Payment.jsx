import React, { useState } from "react";
import axios from "axios";
import PaymentType from "./paymenttype";
import PaymentValid from "./paymentvalid";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { Banknote } from "lucide-react";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const Payment = () => {
  const { selectedSeats } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { booking, trip, route, payment } = location.state || {};
  const [paymentDetails, setPaymentDetails] = useState({
    paymentMethod: "cash",
  });

  // Confrim modal flag
  const [showConfirm, setShowConfirm] = useState(false);

  // overlay screen
  const [alertFlag, setAlertFlag] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [pendingEvent, setPendingEvent] = useState(null);

  const paymentMethodLabels = {
    cash: "Cash",
    standalone: "Standalone (Authorize Only)",
    capture: "Capture (Authorize + Capture)",
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

      setIsLoading(false);
      // Show success toast immediately with backend message
      toast.success("Redirecting to payment page", {
        onClose: () => {
          window.location.href = res.data.PAYMENT_URL;
        },
      });
    } catch (error) {
      setIsLoading(false);
      toast.error(error.response?.data?.message || "An error occurred.");
    }
  };

  const cancelConfirm = (e) => {
    if (e) e.preventDefault();
    setAlertFlag(false);
    setPendingEvent(null);
  };

  return (
    <div className="flex items-center justify-center m-auto">
      <Card className="w-full max-w-lg mx-auto p-2">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Complete payment
          </CardTitle>{" "}
          <p className="ml-1 text-primary text-center font-bold">
            <Banknote className="inline" size={32} color="green" />{" "}
            {trip?.price} EGP
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <PaymentType
              paymentDetails={paymentDetails}
              setPaymentDetails={setPaymentDetails}
              setAlertMessage={setAlertMessage}
              setAlertFlag={setAlertFlag}
            />
            <Button
              type="submit"
              className="w-full"
              onClick={() => setShowConfirm(true)}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Pay Now"}
            </Button>
          </div>
          {isLoading && (
            <div className="text-center mt-4">Processing payment...</div>
          )}

          {/* Confirmation modal for payment method */}
          {showConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
              <PaymentValid
                paymentMethodLabel={
                  paymentMethodLabels[paymentDetails.paymentMethod]
                }
                onConfirm={proceedPayment}
                onClose={cancelConfirm}
              />
            </div>
          )}

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
