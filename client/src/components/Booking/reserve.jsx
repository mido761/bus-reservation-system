import { useLocation, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios from "axios";
import formatDateTime from "../../formatDateAndTime";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { PendingModal } from "./PendingModal.jsx";

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
    if (!route?.route_id) toast.error("No stops found!");
    fetchStops();
  }, [route?.route_id]);

  // Pending confirm
  const handleConfirmPendingBooking = () => {
    toast.success("Proceeding to payment...", {
      onClose: () => {
        navigate("/payment", {
          state: {
            booking: showPendingModal?.booking,
            trip,
            route,
            selectedStop,
          },
        });
      }
    });
    // setTimeout(() => {

    // }, 2000);
  };

  // Pending cancel
  const handleCancelPendingBooking = () => {
    toast.warn("Booking Cancelled!", {
      onClose: () => {
        navigate("/home");
      },
    });
  };

  // Show modal for confirmation
  const handleConfiremReserve = async () => {
    if (!selectedStop) {
      setBookingError("Please select a stop before confirming.");
      return;
    }

    setBookingError("");
    setIsBooking(true);
    try {
      // Api call
      const checkRes = await axios.post(
        `${backEndUrl}/booking/filter-user-bookings`,
        { tripId: trip.trip_id },
        { withCredentials: true }
      );

      // check old bookings and throw toast
      if (checkRes.data.userBookings.length > 0) {
        toast.warn(
          `You already have ${checkRes.data.userBookings.length} booking(s) for this trip.`
        );
      }

      // Always proceed to booking (no window.confirm)
      const res = await axios.post(
        `${backEndUrl}/booking/book`,
        { tripId: trip.trip_id, stopId: selectedStop.stop_id },
        { withCredentials: true }
      );

      const booking = res.data.booked;
      toast.success("Your reservation was successful");
    navigate("/payment", { state: { booking, trip, route, selectedStop } });
  } catch (err) {
    if (err.response?.status === 400) {
      const booking = err.response.data.booking;
      setShowPendingModal({ show: true, booking });
    } else {
      toast.error("Booking failed. Please try again.");
    }
  } finally {
    setIsBooking(false);
  }
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
                  <div className="mt-2 flex items-center gap-2 text-center">
                    <span role="img" aria-label="selected">
                      ✅
                    </span>
                    <pre>
                      You selected: {" "}
                      <strong className="text-blue-400">{selectedStop.stop_name}</strong>
                    </pre>
                  </div>
                )}

                {bookingError && (
                  <pre className="text-destructive mt-2 text-xs text-center">
                    {bookingError}
                  </pre>
                )}
              </div>

              <Button
                className="w-full mt-2"
                onClick={handleConfiremReserve}
                disabled={isBooking}
              >
                {isBooking ? "Processing..." : "procceed to payment"}
              </Button>

              {/* Pending Booking Modal */}
              {showPendingModal.show && (
                <PendingModal
                  showPendingModal={showPendingModal}
                  bookingError={bookingError}
                  handleConfirm={handleConfirmPendingBooking}
                  handleCancel={handleCancelPendingBooking}
                />
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
