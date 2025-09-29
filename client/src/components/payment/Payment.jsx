import React, { useState } from "react";
import axios from "axios";
import PaymentType from "./paymenttype";
import PaymentValid from "./paymentvalid";
import { useLocation } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { Banknote } from "lucide-react";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const Payment = () => {
  const location = useLocation();
  const { booking, trip, route, selectedStop } = location.state || {};
  const [paymentDetails, setPaymentDetails] = useState({
    paymentMethod: "vodafone_cash",
    transactionId: "",
    senderPhone: "",
    policyAccepted: false,
  });
  const [paymentError, setPaymentError] = useState("");
  const [showPolicy, setShowPolicy] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertFlag, setAlertFlag] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const paymentMethodLabels = {
    vodafone_cash: "Vodafone Cash",
    // cash: "Cash",
    // standalone: "Standalone (Authorize Only)",
    // capture: "Capture (Authorize + Capture)",
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (paymentDetails.paymentMethod === "vodafone_cash") {
      if (!paymentDetails.transactionId || !paymentDetails.senderPhone) {
        setPaymentError("Please fill in all payment details.");
        return;
      }
      if (!paymentDetails.policyAccepted) {
        setPaymentError("You must accept the payment policy.");
        return;
      }
    }
    setShowConfirm(true);
  };

  const proceedPayment = async () => {
    setShowConfirm(false);
    setIsLoading(true);
    try {
      if (paymentDetails.paymentMethod === "vodafone_cash") {
        const res = await axios.post(
          `${backEndUrl}/payment/vodafonecash-payment`,
          {
            booking: booking,
            trip: trip,
            route: route,
            trx: paymentDetails.transactionId,
            senderNumber: paymentDetails.senderPhone,
          },
          { withCredentials: true }
        );
        toast.success("Payment submitted successfully!", {
          position: "top-center",
          autoClose: 2000,
          onClose: () => {
            window.location.href = "#/my-account";
          },
        });
        setPaymentDetails({
          paymentMethod: "vodafone_cash",
          transactionId: "",
          senderPhone: "",
          policyAccepted: false,
        });
        setPaymentError("");
      } else {
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred.", {
        position: "top-center",
        autoClose: 2500,
      });
      setPaymentError("");
    } finally {
      setIsLoading(false);
    }
  };

  const cancelConfirm = () => {
    setShowConfirm(false);
  };

  return (
    <div className="flex items-center justify-center m-auto">
      <Card className="w-full max-w-lg mx-auto p-2">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Complete payment
          </CardTitle>
          <p className="ml-1 text-primary text-center font-bold">
            <Banknote className="inline" size={32} color="green" />{" "}
            {trip?.price} EGP
          </p>
        </CardHeader>
        <CardContent>
          {trip && route && selectedStop ? (
            <form
              onSubmit={handleSubmitPayment}
              className="space-y-4 mt-6 p-4 border rounded-lg bg-gray-50 shadow-sm"
            >
              {/* <PaymentType
                paymentDetails={paymentDetails}
                setPaymentDetails={setPaymentDetails}
                setAlertMessage={setAlertMessage}
                setAlertFlag={setAlertFlag}
              /> */}
              {paymentDetails.paymentMethod === "vodafone_cash" && (
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Transaction ID
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter Transaction ID"
                      value={paymentDetails.transactionId}
                      onChange={(e) =>
                        setPaymentDetails({
                          ...paymentDetails,
                          transactionId: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Sender Phone Number
                    </label>
                    <Input
                      type="tel"
                      placeholder="e.g. 010xxxxxxxx"
                      value={paymentDetails.senderPhone}
                      onChange={(e) =>
                        setPaymentDetails({
                          ...paymentDetails,
                          senderPhone: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="policy"
                      checked={paymentDetails.policyAccepted}
                      onChange={() =>
                        setPaymentDetails({
                          ...paymentDetails,
                          policyAccepted: !paymentDetails.policyAccepted,
                        })
                      }
                    />
                    <label htmlFor="policy" className="text-sm cursor-pointer">
                      I accept the{" "}
                      <button
                        type="button"
                        className="underline text-blue-600 hover:text-blue-800"
                        onClick={() => setShowPolicy(true)}
                      >
                        payment policy
                      </button>
                    </label>
                    {showPolicy && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
                          <h2 className="text-xl font-bold mb-4 text-center">
                            سياسة الدفع | Payment Policy
                          </h2>
                          <div className="mb-4 text-sm text-gray-700 max-h-60 overflow-y-auto">
                            <p className="space-y-2">
                              {/* Arabic Version */}
                              <strong>العربية:</strong>
                              <br />
                              1. جميع المدفوعات نهائية وغير قابلة للاسترداد إلا
                              إذا نصّت الشركة على خلاف ذلك.
                              <br />
                              2. يُرجى التأكد من صحة رقم عملية الدفع ورقم الهاتف
                              المُرسل قبل الإرسال.
                              <br />
                              3. يجب إتمام الدفع خلال الفترة المحددة لتأكيد
                              الحجز.
                              <br />
                              4. في حال وجود أي مشكلة، يُرجى التواصل مع خدمة
                              العملاء وتزويدهم بتفاصيل عملية الدفع.
                              <br />
                              <br />
                              {/* English Version */}
                              <strong>English:</strong>
                              <br />
                              1. All payments are final and non-refundable
                              unless otherwise specified by the company.
                              <br />
                              2. Please ensure that your transaction ID and
                              sender’s phone number are accurate before
                              submission.
                              <br />
                              3. Payment must be completed within the designated
                              time frame to secure your reservation.
                              <br />
                              4. For any issues, please contact customer support
                              and provide your transaction details.
                              <br />
                            </p>
                          </div>
                          <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-lg"
                            onClick={() => setShowPolicy(false)}
                            aria-label="Close"
                          >
                            ×
                          </button>
                          <Button
                            className="w-full mt-2"
                            type="button"
                            onClick={() => setShowPolicy(false)}
                          >
                            إغلاق | Close
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {paymentError && (
                <pre className="text-destructive mt-2 text-xs text-center">
                  {paymentError}
                </pre>
              )}
              <Button
                className="w-full mt-2"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Submit Payment"}
              </Button>
            </form>
          ) : (
            <div className="text-center text-destructive">
              No trip or stop selected.
            </div>
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
