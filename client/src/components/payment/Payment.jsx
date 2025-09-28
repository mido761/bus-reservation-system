import { useLocation } from "react-router-dom";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";


const Payment = () => {
  const location = useLocation();
  const {booking, trip, route, selectedStop } = location.state || {};
  const [paymentMethod, setPaymentMethod] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (paymentMethod === "vodafone_cash") {
      if (!transactionId || !senderPhone) {
        setPaymentError("Please fill in all payment details.");
        return;
      }
      if (!policyAccepted) {
        setPaymentError("You must accept the payment policy.");
        return;
      }
    }
    try {
      const res = await axios.post(
        `${backEndUrl}/payment/vodafonecash-payment`,
        {
          booking: booking,
          trip: trip,
          route: route,
          trx: transactionId,
          senderNumber: senderPhone
          
        },
        { withCredentials: true }
      );

      
      // Show success toast immediately with backend message
      toast.success("Redirecting to payment page", {
        onClose: () => {
          window.location.href = res.data.PAYMENT_URL;
        },
      });
    } catch (error) {
      
      toast.error(error.response?.data?.message || "An error occurred.");
    }
  ;
    // Simulate payment submission
    toast.success("Payment submitted successfully!", {
      position: "top-center",
      autoClose: 2000,
      onClose: () => {
        window.location.hash = "#/payment";
      },
    });
    setTransactionId("");
    setSenderPhone("");
    setPolicyAccepted(false);
    setPaymentError("");
  };


  return (
    <div className="flex items-center justify-center w-full m-auto">
      <Card className="w-full max-w-sm md:max-w-xl mx-auto p-2">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Payment
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trip && route && selectedStop ? (
            <form onSubmit={handleSubmitPayment} className="mt-6 p-4 border rounded-lg bg-gray-50 shadow-sm">
              <h2 className="text-center font-bold text-lg mb-4">Select Payment Method</h2>
              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="vodafone_cash"
                    checked={paymentMethod === "vodafone_cash"}
                    onChange={() => setPaymentMethod("vodafone_cash")}
                  />
                  Vodafone Cash
                </label>
                {/* Add more payment methods here if needed */}
              </div>
              {paymentMethod === "vodafone_cash" && (
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Transaction ID
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter Transaction ID"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Sender Phone Number
                    </label>
                    <Input
                      type="tel"
                      placeholder="e.g. 010xxxxxxxx"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="policy"
                      checked={policyAccepted}
                      onChange={() => setPolicyAccepted((v) => !v)}
                    />
                    <label htmlFor="policy" className="text-sm cursor-pointer">
                      I accept the <button type="button" className="underline text-blue-600 hover:text-blue-800" onClick={() => setShowPolicy(true)}>payment policy</button>
                    </label>
      {/* Payment Policy Modal */}
      {showPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
            <h2 className="text-xl font-bold mb-4 text-center">Payment Policy</h2>
            <div className="mb-4 text-sm text-gray-700 max-h-60 overflow-y-auto">
              <p>
                1. All payments are final and non-refundable unless otherwise stated by the company.<br/>
                2. Ensure your transaction ID and sender phone number are correct before submitting.<br/>
                3. Payment must be completed within the specified time to confirm your reservation.<br/>
                4. For any issues, contact customer support with your transaction details.<br/>
              </p>
            </div>
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-lg"
              onClick={() => setShowPolicy(false)}
              aria-label="Close"
            >
              ×
            </button>
            <Button className="w-full mt-2" type="button" onClick={() => setShowPolicy(false)}>
              Close
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
              <Button className="w-full mt-2" type="submit">
                Submit Payment
              </Button>
            </form>
          ) : (
            <div className="text-center text-destructive">
              No trip or stop selected.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Payment;
