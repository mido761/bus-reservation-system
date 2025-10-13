import { useLocation, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios from "axios";
import formatDateTime from "../../formatDateAndTime";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const Reserve = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { trip, route } = location.state || {};
  const [stops, setStops] = useState([]);
  const [selectedStop, setSelectedStop] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Fetch stops for the selected route
  const fetchStops = async () => {
    try {
      const res = await axios.get(
        `${backEndUrl}/stop/get-stops-route/${route?.route_id}`
      );
      setStops(res.data.stops);
    } catch (err) {
      console.error("Error fetching stops:", err);
      setStops([]);
    }
  };

  useEffect(() => {
    if (route?.route_id) {
      fetchStops();
    }
  }, [route?.route_id]);

  // Handle confirmation dialog
  const handleShowConfirmation = () => {
    if (!selectedStop) {
      setBookingError("Please select a stop before proceeding.");
      return;
    }
    setBookingError("");
    setShowConfirmation(true);
  };

  // Handle confirmed booking
  const handleConfirmBooking = async () => {
    setShowConfirmation(false);
    setIsBooking(true);
    setBookingError("");
    
    try {
      const res = await axios.post(
        `${backEndUrl}/booking/book`,
        { tripId: trip.trip_id, stopId: selectedStop.stop_id },
        { withCredentials: true }
      );

      if (res.data.booked) {
        setIsRedirecting(true);
        
        // Show redirecting message and navigate after a brief delay
        setTimeout(() => {
          navigate("/my-account");
        }, 1500);
      } else {
        setBookingError("Booking was not created successfully. Please try again.");
      }
      
    } catch (err) {
      console.error("Booking error:", err);
      setBookingError(
        err.response?.data?.message || 
        "Booking failed. Please check your connection and try again."
      );
    } finally {
      setIsBooking(false);
    }
  };

  // Handle cancel confirmation
  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
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
                      onClick={() => {
                        setSelectedStop(stop);
                      }}
                    >
                      <span role="img" aria-label="stop">
                        🚌
                      </span>
                      <span className="font-semibold">{stop.stop_name}</span>
                    </Button>
                  ))}
                </div>
                {selectedStop && (
                  <div className="mt-2 flex items-center gap-2 text-center bg-green-50 p-2 rounded-md">
                    <span role="img" aria-label="selected">
                      ✅
                    </span>
                    <span className="text-sm">
                      You selected: <strong className="text-green-600">{selectedStop.stop_name}</strong>
                    </span>
                  </div>
                )}

                {bookingError && (
                  <div className="text-destructive mt-2 text-sm text-center bg-destructive/10 p-2 rounded-md">
                    {bookingError}
                  </div>
                )}
              </div>

              <Button
                className="w-full mt-2"
                onClick={handleShowConfirmation}
                disabled={isBooking || isRedirecting}
              >
                {isBooking ? "Processing..." : isRedirecting ? "Redirecting to your bookings..." : "Proceed to Payment"}
              </Button>

              {/* Confirmation Dialog */}
              <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Confirm Booking</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to proceed with this booking? You will be redirected to your bookings page after confirmation.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <div className="space-y-2 text-sm">
                      <div><strong>Route:</strong> {route.source} → {route.destination}</div>
                      <div><strong>Date:</strong> {formatDateTime(trip.date, "date")}</div>
                      <div><strong>Stop:</strong> {selectedStop?.stop_name}</div>
                    </div>
                  </div>
                  <DialogFooter className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handleCancelConfirmation}
                      disabled={isBooking}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleConfirmBooking}
                      disabled={isBooking}
                    >
                      {isBooking ? "Processing..." : "Confirm Booking"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
