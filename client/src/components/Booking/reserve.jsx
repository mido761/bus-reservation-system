import { useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios from "axios";
import formatDateTime from "../../formatDateAndTime";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const Reserve = () => {
  const location = useLocation();
  const { trip, route } = location.state || {};
  const [stops, setStops] = useState([]);
  const [selectedStop, setSelectedStop] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [senderPhone, setSenderPhone] = useState("");

  // Api call (fetch stops)
  const fetchStops = async () => {
    try {
      const res = await axios.get(
        `${backEndUrl}/stop/get-stops-route/${route?.route_id}`
      );
      setStops(res.data.stops);
    } catch (err) {
      setStops([]);
    }
  };

  useEffect(() => {
    if (route?.route_id) fetchStops();
  }, [route?.route_id]);

  // Just show payment form (no backend call here)
  const handleShowPaymentForm = () => {
    if (!selectedStop) {
      setBookingError("Please select a stop before continuing.");
      return;
    }
    setBookingError("");
    setShowPaymentForm(true);
  };

  // Submit payment (front-only for now)
  const handleSubmitPayment = () => {
    if (!transactionId || !senderPhone) {
      setBookingError("Please fill in all payment details.");
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
      window.location.hash = "#/my-account";
    },
    });

    // Reset form
    setTransactionId("");
    setSenderPhone("");
    setShowPaymentForm(false);
  };

  return (
    <div className="flex items-center justify-center w-full m-auto">
      <Card className="w-full max-w-sm md:max-w-xl mx-auto p-2">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Trip Details</CardTitle>
        </CardHeader>
        <CardContent>
          {trip ? (
            <>
              {/* Trip details */}
              <div className="mb-4 space-y-1">
                <div>
                  <strong>Route:</strong> {route.source} → {route.destination}
                </div>
                <div>
                  <strong>Date:</strong> {formatDateTime(trip.date, "date")}
                </div>
                <div>
                  <strong>Departure:</strong>{" "}
                  {formatDateTime(trip.departure_time)}
                </div>
                <div>
                  <strong>Arrival:</strong> {formatDateTime(trip.arrival_time)}
                </div>
              </div>

              {/* Stops */}
              <div className="mb-4">
                <h2 className="font-semibold mb-2">Select a stop:</h2>
                <div className="grid grid-cols-2 gap-2">
                  {stops.map((stop) => (
                    <Button
                      key={stop.stop_id}
                      variant={
                        selectedStop?.stop_id === stop.stop_id
                          ? "secondary"
                          : "outline"
                      }
                      className="w-full flex items-center gap-2"
                      onClick={() => setSelectedStop(stop)}
                    >
                      🚌
                      <span className="font-semibold">{stop.stop_name}</span>
                    </Button>
                  ))}
                </div>

                {selectedStop && (
                  <div className="mt-2 flex items-center gap-2 text-center">
                    ✅
                    <pre>
                      You selected:{" "}
                      <strong className="text-blue-400">
                        {selectedStop.stop_name}
                      </strong>
                    </pre>
                  </div>
                )}

                {bookingError && (
                  <pre className="text-destructive mt-2 text-xs text-center">
                    {bookingError}
                  </pre>
                )}
              </div>

              {!showPaymentForm && (
                <Button className="w-full mt-2" onClick={handleShowPaymentForm}>
                  Complete
                </Button>
              )}

              {/* Vodafone Cash Payment Form */}
              {showPaymentForm && (
                <div className="mt-6 p-4 border rounded-lg bg-gray-50 shadow-sm">
                  <h2 className="text-center font-bold text-lg mb-4">
                    Vodafone Cash Details
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
                    <Button
                      className="w-full mt-2"
                      onClick={handleSubmitPayment}
                    >
                      Submit Payment
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-destructive">
              No trip selected.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reserve;
