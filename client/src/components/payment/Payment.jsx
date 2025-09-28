import { useLocation } from "react-router-dom";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";

const Payment = () => {
  const location = useLocation();
  const { trip, route, selectedStop } = location.state || {};
  const [transactionId, setTransactionId] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [paymentError, setPaymentError] = useState("");

  const handleSubmitPayment = () => {
    if (!transactionId || !senderPhone) {
      setPaymentError("Please fill in all payment details.");
      return;
    }

    console.log("Submitting payment:", {
      stop: selectedStop,
      transactionId,
      senderPhone,
    });

    // Toastify notification
    toast.success("Payment submitted successfully!", {
      position: "top-center",
      autoClose: 2000,
      onClose: () => {
        window.location.hash = "#/payment";
      },
    });

    // Reset form
    setTransactionId("");
    setSenderPhone("");
  };

  return (
    <div className="flex items-center justify-center w-full m-auto">
      <Card className="w-full max-w-sm md:max-w-xl mx-auto p-2">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Vodafone Cash Payment
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trip && route && selectedStop ? (
            <div className="mt-6 p-4 border rounded-lg bg-gray-50 shadow-sm">
              <h2 className="text-center font-bold text-lg mb-4">
                Payment Details
              </h2>
              <div className="space-y-3">
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

                {paymentError && (
                  <pre className="text-destructive mt-2 text-xs text-center">
                    {paymentError}
                  </pre>
                )}

                <Button className="w-full mt-2" onClick={handleSubmitPayment}>
                  Submit Payment
                </Button>
              </div>
            </div>
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
