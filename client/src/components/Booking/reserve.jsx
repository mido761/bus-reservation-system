import { useLocation, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios from "axios";
import formatDateTime from "../../formatDateAndTime";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
const backEndUrl = import.meta.env.VITE_BACK_END_URL;
const Reserve = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { trip, route } = location.state || {};
  const [stops, setStops] = useState([]);
  const [selectedStop, setSelectedStop] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [showPendingModal, setShowPendingModal] = useState({
    show: false,
    booking: null,
  });
  const { toast } = useToast();
  useEffect(() => {
    const fetchStops = async () => {
      try {
        const res = await axios.get(
          `${backEndUrl}/stop/get-stops-route/${route?.route_id}`
        );
        setStops(res.data.stops);
      } catch (err) {
        setStops([]);
        toast({
          title: "Error",
          description: "Failed to fetch stops.",
          variant: "destructive",
        });
      }
    };
    if (route?.route_id) fetchStops();
  }, [route?.route_id, toast]);
  // Show modal for confirmation
  const handleConfiremreserve = () => {
    if (!selectedStop) {
      setBookingError("");
      toast({
        title: "Select a stop",
        description: "Please select a stop before confirming.",
        variant: "destructive",
      });
      return;
    }
    setBookingError("");
    setShowModal(true);
  };

  const handleModalConfirm = async () => {
    setIsBooking(true);
    setBookingError("");
    try {
      const checkRes = await axios.post(
        `${backEndUrl}/booking/filter-user-bookings`,
        { tripId: trip.trip_id },
        { withCredentials: true }
      );
      if (checkRes.data.userBookings.length > 0) {
        toast({
          title: "Multiple Bookings",
          description: `You already have ${checkRes.data.userBookings.length} booking(s) for this trip.`,
        });
      }
      // Always proceed to booking (no window.confirm)
      const res = await axios.post(
        `${backEndUrl}/booking/book`,
        { tripId: trip.trip_id, stopId: selectedStop.stop_id },
        { withCredentials: true }
      );
      const booking = res.data.booked;
      setShowModal(false);
      toast({
        title: "Reservation Confirmed",
        description: "Your reservation was successful!",
      });
      navigate("/payment", { state: { booking, trip, route } });
    } catch (err) {
      if (err.response && err.response.status === 400) {
        // Pending booking case
        const booking = err.response.data.booking;
        setBookingError(err.response.data.message);
        setShowModal(false);
        setShowPendingModal({ show: true, booking });
        toast({
          title: "Pending Booking",
          description: err.response.data.message,
          variant: "destructive",
        });
      } else {
        setBookingError("Booking failed. Please try again.");
        toast({
          title: "Error",
          description: "Booking failed. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="flex items-center justify-center m-auto">
      <Card className="w-full max-w-lg mx-auto p-2">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Reserve Your Trip
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trip ? (
            <>
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
              <div className="mb-4">
                <div className="font-semibold mb-2">Select a stop:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                        toast({
                          title: "Stop Selected",
                          description: stop.stop_name,
                        });
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
                  <div className="mt-2 flex items-center gap-2 text-center">
                    <span role="img" aria-label="selected">
                      ✅
                    </span>
                    <pre>
                      You selected: <strong className="text-blue-400">{selectedStop.stop_name}</strong>
                    </pre>
                  </div>
                )}
              </div>
              <Button
                className="w-full mt-2"
                onClick={handleConfiremreserve}
                disabled={isBooking}
              >
                {isBooking ? "Processing..." : "Confirm Reservation"}
              </Button>
              {/* Pending Booking Modal */}
              {showPendingModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                  <Card className="max-w-xs w-full p-4 text-center">
                    <CardHeader>
                      <CardTitle className="text-lg text-center">
                        Error While Booking
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-2 text-destructive">
                        {bookingError}
                      </div>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <span role="img" aria-label="stop">
                          🚌
                        </span>
                        <span className="font-semibold">
                          {showPendingModal.booking.stop_name}
                        </span>
                        <span className="text-muted-foreground">
                          {showPendingModal.booking.location}
                        </span>
                      </div>
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="default"
                          onClick={() => {
                            toast({
                              title: "Reservation Completed",
                              description: "Proceeding to payment.",
                            });
                            navigate("/payment", {
                              state: {
                                booking: showPendingModal.booking,
                                trip,
                                route,
                              },
                            });
                          }}
                        >
                          Complete Reservation
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            toast({
                              title: "Reservation Cancelled",
                              description: "You cancelled the reservation.",
                            });
                            navigate("/home");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              {/* Confirmation Modal */}
              {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                  <Card className="max-w-md w-full p-4">
                    <CardHeader>
                      <CardTitle className="text-lg text-left">
                        Confirm Your Reservation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-2">
                        <div>
                          <strong>Route:</strong> {route.source} →{" "}
                          {route.destination}
                        </div>
                        <div>
                          <strong>Date:</strong> {trip.date}
                        </div>
                        <div>
                          <strong>Departure:</strong>{" "}
                          {formatDateTime(trip.departure_time)}
                        </div>
                        <div>
                          <strong>Arrival:</strong>{" "}
                          {formatDateTime(trip.arrival_time)}
                        </div>
                        <div>
                          <strong>Selected Stop:</strong>{" "}
                          {selectedStop?.stop_name} – {selectedStop?.location}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="default"
                          onClick={handleModalConfirm}
                          disabled={isBooking}
                        >
                          {isBooking ? "Processing..." : "Confirm"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowModal(false)}
                          disabled={isBooking}
                        >
                          Cancel
                        </Button>
                      </div>
                      {bookingError && (
                        <div className="text-destructive mt-2 font-medium">
                          {bookingError}
                        </div>
                      )}
                    </CardContent>
                  </Card>
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
