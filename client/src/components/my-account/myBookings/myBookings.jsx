import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // ✅ Import Button
import { toast } from "react-toastify";
import Overlay from "../../overlayScreen/overlay";
import formatDateAndTime from "../../../formatDateAndTime";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const statusStyles = {
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  pending: "bg-blue-100 text-blue-800",
};

const MyBookings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showTrips, setShowTrips] = useState(true);
  const [trips, setTrips] = useState([]);
  const [stops, setStops] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState("");
  const [selectedBooking, setSelectedBooking] = useState("");
  const [bookings, setBookings] = useState([]);
  const [cancelledId, setCancelledId] = useState(null); // ✅ Added state

  const fetchBookings = async () => {
    try {
      await axios.get(`${backEndUrl}/auth`, { withCredentials: true });
      const res = await axios.get(`${backEndUrl}/booking/get-user-bookings`, {
        withCredentials: true,
      });
      setBookings(res.data.userBookings || []);
    } catch (err) {
      console.error("Error fetching user bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch trips 
  const fetchTrips = async () => {
    try {
      const res = await fetch(`${backEndUrl}/trip/get-trips-with-counts`);
      if (!res.ok) throw new Error("Failed to fetch trips");
      setTrips(await res.json());
    } catch (err) {
      setError("Failed to load trips");
      toast.error("Failed to load trips");
    }
  };

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


  const handleSwitchClick = async (booking) => {
    setSelectedBooking(booking);
    setShowTrips(true);
  };

  const handleSwitch = async (tripId, bookingId, stopId) => {
    try {
      // const res = await axios.post(`${backEndUrl}/booking/switch-booking`, { tripId, stopId, bookingId }, { withCredentials: true });

      // toast.success(
      //   "Trip switched successfully"
      // );
      console.log(selectedBooking);
    } catch (err) {
      console.error("Error Switching Trip: ", err);
      toast.error(err.response.data.messsage || "Switch failed! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?"))
      return;

    try {
      setCancelledId(bookingId);
      await axios.post(
        `${backEndUrl}/booking/cancel-booking`,
        { bookingId },
        {
          withCredentials: true,
        }
      );
      setBookings((prev) =>
        prev.map((booking) =>
          booking.booking_id === bookingId
            ? { ...booking, status: "cancelled" }
            : booking
        )
      );
      toast.success(
        "Booking cancelled successfully, check payment status for refund requests"
      );
      // setBookings((prev) => prev.filter((b) => b.booking_id !== bookingId));
    } catch (err) {
      console.error("Error cancelling booking:", err);
      toast.error("Cancellation failed! Please try again.");
    } finally {
      setCancelledId(null);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchTrips();
    fetchStops();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Loading your bookings...
      </div>
    );

  if (!bookings.length)
    return (
      <div className="flex justify-center items-center h-64 text-gray-400">
        No bookings yet.
      </div>
    );


  function alertBody(trip, booking, stops) {
    return (
      <>
        <Card key={booking.booking_id}
          className="shadow-sm hover:shadow-md transition p-4 rounded-lg cursor-pointer ">
          <CardTitle>Current: </CardTitle>
          <CardContent className="w-full p-0 text-sm sm:flex sm:flex-row md:flex-col sm:justify-between">
            <div>
              <p>{booking.source} --- {booking.destination}</p>

              <p>{booking.stop_name}</p>
              <p>{booking.price}</p>
            </div>
          </CardContent>
        </Card>

        <Card key={trip.trip_id}
          onClick={() => setSelectedTripId(!selectedTripId ? trip.trip_id : "")}
          className={`shadow-sm hover:shadow-md transition p-4 rounded-lg cursor-pointer 
          ${selectedTripId === trip.trip_id ? "bg-blue-100 border border-blue-400" : "bg-white"}
        `}>
          <CardTitle>Trips: </CardTitle>

          <CardContent className="w-full p-0 text-sm sm:flex sm:flex-row md:flex-col sm:justify-between">
            <p>{trip.source} --- {trip.destination}</p>
          </CardContent>
        </Card>

        <Card key={stop.stop_id}
          onClick={() => setSelectedTripId(!selectedTripId ? trip.trip_id : "")}
          className={`shadow-sm hover:shadow-md transition p-4 rounded-lg cursor-pointer 
          ${selectedTripId === trip.trip_id ? "bg-blue-100 border border-blue-400" : "bg-white"}
        `}>
          <CardTitle>Stops: </CardTitle>

          <CardContent className="w-full p-0 text-sm sm:flex sm:flex-row md:flex-col sm:justify-between">
            <p>{trip.source} --- {trip.destination}</p>
          </CardContent>
        </Card>
      </>

    );
  }

  return (
    <>
      {/* Trips Available to switch */}
      {showTrips && (
        trips.map((trip) => (
          <Overlay alertFlag={showTrips}
            alertMessage={() => alertBody(trip, selectedBooking, stops)}
            setAlertFlag={setShowTrips}
            customButton={<Button onClick={() => handleSwitch(trip.trip_id, selectedBooking.booking_id, selectedBooking.stop_id)}>Confirm Swtich</Button>}
          >
          </Overlay>

        ))
      )
      }
      <h2 className="text-2xl font-semibold p-4">My Bookings</h2>

      <div className="grid gap-6 md:grid-cols-2">
        {bookings.map((booking, idx) => (
          <Card
            key={booking.booking_id || idx}
            className="shadow-sm hover:shadow-md transition p-4 rounded-lg"
          >
            {/* <CardHeader className="p-2">
              <CardTitle className="text-lg font-medium text-left">
                {booking.source} → {booking.destination}
              </CardTitle>
            </CardHeader> */}

            <CardContent className="w-full p-0 text-sm sm:flex sm:flex-row md:flex-col sm:justify-between">
              <section>
                <div className="text-xl sm:flex sm:flex-row sm:justify-between gap-4 sm:items-center">
                  <strong className="text-primary">
                    {" "}
                    {booking.stop_name.toUpperCase()}{" "}
                  </strong>
                  {/* </div>

                <div className="text-lg text-gray-600 font-bold flex items-center gap-1 mt-1"> */}
                  <p className="text-lg text-gray-600 font-bold flex items-center gap-1 mt-1">
                    <span>📅</span>
                    <span>{formatDateAndTime(booking.date, "date")}</span>
                  </p>
                </div>

                <div className="flex justify-start items-center my-4 gap-4">
                  <span>
                    <strong className="">
                      EGP {booking.amount || booking.price}
                    </strong>
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[booking.status] ||
                      "bg-gray-100 text-gray-700"
                      }`}
                  >
                    {booking.status.toUpperCase()}
                  </span>
                </div>
              </section>

              <section>
                <div>
                  <strong className="text-gray-500">Booked At: </strong>
                  {formatDateAndTime(booking.booked_at, "dateTime")}
                </div>

                <div>
                  <strong className="text-gray-500">Last Update: </strong>
                  {formatDateAndTime(booking.updated_at, "dateTime")}
                </div>
              </section>

              {/* CTA Buttons */}
              {booking.status && <div className="w-full pt-4 flex flex-col items-center justify-center">
                {["waiting", "confirmed"].includes(booking.status) &&
                  <div className="w-full pt-4 flex flex-row justify-center gap-4">
                    {/* <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() => handleComplete(booking.booking_id)}
                    disabled={cancelledId === booking.booking_id}
                  >
                    {cancelledId === booking.booking_id
                      ? "Complete..."
                      : "Complete"}
                  </Button> */}
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      className="w-full"
                      onClick={() => navigate("/passengers", { state: { busId: booking.bus_id } })}
                    >
                      List
                    </Button>


                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      className="w-full"
                      onClick={() => handleSwitchClick(booking)}
                    >
                      Switch trip
                    </Button>
                  </div>
                }

                {!["cancelled", "failed", "expired"].includes(booking.status) && (
                  <div className="w-full pt-4 flex justify-center gap-4">
                    <Button
                      type="button"
                      variant="destructive"
                      className="w-full"
                      size="sm"
                      onClick={() => handleCancel(booking.booking_id)}
                      disabled={cancelledId === booking.booking_id}
                    >
                      {cancelledId === booking.booking_id
                        ? "Canceling..."
                        : "Cancel"}
                    </Button>
                  </div>
                )}
              </div>}

            </CardContent>
          </Card>
        ))}
      </div>


    </>
  );
};

export default MyBookings;
