import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import Overlay from "../../overlayScreen/overlay";
import formatDateAndTime from "../../../formatDateAndTime";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const statusStyles = {
  confirmed: "bg-green-100 text-green-800",
  waiting: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800",
  failed: "bg-red-100 text-red-800",
  expired: "bg-gray-100 text-gray-700",
  pending: "bg-blue-100 text-blue-800",
};

const MyBookings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [overlayLoading, setOverlayLoading] = useState(false);
  const [showTrips, setShowTrips] = useState(false);

  const [bookings, setBookings] = useState([]);
  const [trips, setTrips] = useState([]);
  const [stops, setStops] = useState([]);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedTripId, setSelectedTripId] = useState("");
  const [selectedStopId, setSelectedStopId] = useState("");
  const [cancelledId, setCancelledId] = useState(null);

  // 🔹 Fetch all bookings for current user
  const fetchBookings = async () => {
    try {
      await axios.get(`${backEndUrl}/auth`, { withCredentials: true });
      const res = await axios.get(`${backEndUrl}/booking/get-user-bookings`, {
        withCredentials: true,
      });
      setBookings(res.data.userBookings || []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch all trips
  const fetchTrips = async () => {
    try {
      const res = await fetch(`${backEndUrl}/trip/get-trips-with-counts`);
      const data = await res.json();
      setTrips(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load trips", err);
      toast.error("Failed to load trips");
    }
  };

  // 🔹 Fetch all stops
  const fetchStops = async () => {
    try {
      const res = await fetch(`${backEndUrl}/stop/get-stops`);
      const data = await res.json();
      setStops(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load stops", err);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchTrips();
    fetchStops();
  }, []);

  // 🔹 Trips available on the same day as the selected booking
  const sameDayTrips = useMemo(() => {
    if (!selectedBooking?.date) return [];
    const selectedDate = new Date(selectedBooking.date).toDateString();
    return trips.filter((trip) => {
      const d = trip.date || trip.trip_date || trip.departure_date;
      return d && new Date(d).toDateString() === selectedDate;
    });
  }, [selectedBooking, trips]);

  // 🔹 Filter stops belonging to the selected trip
  const assignedStops = useMemo(() => {
    if (!selectedTripId) return [];
    return stops.filter((stop) => stop.trip_id === selectedTripId);
  }, [selectedTripId, stops]);

  // 🔹 Handle switching a booking to another trip
  const handleSwitch = async () => {
    if (!selectedTripId || !selectedBooking) {
      toast.error("Select a trip to switch to");
      return;
    }

    setOverlayLoading(true);
    try {
      await axios.post(
        `${backEndUrl}/booking/switch-booking`,
        {
          newTripId: selectedTripId,
          newStopId: selectedStopId || selectedBooking.stop_id,
          bookingId: selectedBooking.booking_id,
        },
        { withCredentials: true }
      );

      toast.success("Trip switched successfully");

      // 🔁 Refresh data immediately after switching
      await fetchBookings();
      fetchTrips();
      setShowTrips(false);
      setSelectedTripId("");
      setSelectedStopId("");
      setSelectedBooking(null);
    } catch (err) {
      console.error("Error switching trip:", err);
      toast.error(err?.response?.data?.message || "Switch failed");
    } finally {
      setOverlayLoading(false);
    }
  };

  // 🔹 Cancel booking
  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      setCancelledId(bookingId);
      await axios.post(
        `${backEndUrl}/booking/cancel-booking`,
        { bookingId },
        { withCredentials: true }
      );

      // Update status locally
      setBookings((prev) =>
        prev.map((b) =>
          b.booking_id === bookingId ? { ...b, status: "cancelled" } : b
        )
      );

      toast.success("Booking cancelled successfully");
    } catch (err) {
      console.error("Error cancelling booking:", err);
      toast.error("Cancellation failed");
    } finally {
      setCancelledId(null);
    }
  };

  // 🔹 Navigate to passenger list
  const handleList = async (booking) => {
    try {
      await axios.get(`${backEndUrl}/auth`, { withCredentials: true });
      const res = await axios.get(
        `${backEndUrl}/booking/booking-info/${booking.booking_id}`,
        { withCredentials: true }
      );

      const b = Array.isArray(res.data.booking)
        ? res.data.booking[0]
        : res.data.booking;
      const tripId = booking.trip_id || b?.trip_id;

      if (!tripId) return toast.error("No trip linked to this booking");

      navigate("/passengers", { state: { tripId, bookingId: booking.booking_id } });
    } catch (err) {
      console.error("Error opening passenger list:", err);
      toast.error("Unable to open passenger list");
    }
  };

  // 🔹 Open switch overlay
  const handleSwitchClick = (booking) => {
    setSelectedBooking(booking);
    setShowTrips(true);
  };

  // 🔹 Overlay body content
  const renderOverlayContent = (booking, availableTrips) => (
    <>
      <Card className="p-4 rounded-lg shadow-sm">
        <CardTitle>Current Booking</CardTitle>
        <CardContent className="text-sm mt-2">
          <p><strong>Route:</strong> {booking.source} → {booking.destination}</p>
          <p><strong>Stop:</strong> {booking.stop_name}</p>
          <p><strong>Amount:</strong> EGP {booking.amount || booking.price}</p>
          <p><strong>Date:</strong> {formatDateAndTime(booking.date, "date")}</p>
          <p>
            <strong>Departure Time:</strong>{" "}
            {formatDateAndTime(
              booking.departure_time || booking.time || booking.date,
              "time"
            )}
          </p>
        </CardContent>
      </Card>

      <Card className="p-4 mt-4 rounded-lg shadow-sm">
        <CardTitle>Available Trips (Same Day)</CardTitle>
        <CardContent className="text-sm mt-2">
          {availableTrips.length === 0 ? (
            <div className="text-gray-500">No trips available for this day.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {availableTrips.map((trip) => {
                const tripDate = trip.date || trip.trip_date || trip.departure_date;
                const tripTime = trip.departure_time || trip.time || tripDate;
                return (
                  <div
                    key={trip.trip_id}
                    onClick={() => setSelectedTripId(trip.trip_id)}
                    className={`border rounded p-3 cursor-pointer transition ${
                      selectedTripId === trip.trip_id
                        ? "bg-blue-100 border-blue-400"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    <p className="font-medium">{trip.source} → {trip.destination}</p>
                    <p className="text-xs text-gray-600">
                      <strong>Date:</strong> {formatDateAndTime(tripDate, "date")}
                    </p>
                    <p className="text-xs text-gray-600">
                      <strong>Departure Time:</strong>{" "}
                      {formatDateAndTime(tripTime, "time")}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {selectedTripId && assignedStops.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Select Stop</label>
              <select
                value={selectedStopId}
                onChange={(e) => setSelectedStopId(e.target.value)}
                className="border rounded-md p-2 w-full text-sm"
              >
                <option value="">-- Select Stop --</option>
                {assignedStops.map((stop) => (
                  <option key={stop.stop_id} value={stop.stop_id}>
                    {stop.stop_name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );

  // 🔹 UI Render
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

  return (
    <>
      {showTrips && (
        <Overlay
          alertFlag={showTrips}
          alertMessage={() => renderOverlayContent(selectedBooking, sameDayTrips)}
          setAlertFlag={(flag) => {
            setShowTrips(flag);
            if (!flag) {
              setSelectedTripId("");
              setSelectedStopId("");
              setSelectedBooking(null);
            }
          }}
          customButton={
            <Button onClick={handleSwitch} disabled={!selectedTripId || overlayLoading}>
              {overlayLoading ? "Switching..." : "Confirm Switch"}
            </Button>
          }
        />
      )}

      <h2 className="text-2xl font-semibold p-4">My Bookings</h2>

      <div className="grid gap-6 md:grid-cols-2">
        {bookings.map((booking) => (
          <Card key={booking.booking_id} className="shadow-sm p-4 rounded-lg">
            <CardContent className="text-sm">
              <div className="flex justify-between items-center mb-2">
                <strong className="text-primary">
                  {booking.stop_name?.toUpperCase()}
                </strong>
                <span className="text-gray-600 font-semibold">
                  {formatDateAndTime(booking.date, "date")}
                </span>
              </div>

              <p>
                <strong>Departure Time:</strong>{" "}
                {formatDateAndTime(
                  booking.departure_time || booking.time || booking.date,
                  "time"
                )}
              </p>

              <p className="my-2">
                <strong>Price:</strong> EGP {booking.amount || booking.price}
              </p>

              <p
                className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                  statusStyles[booking.status] ||
                  "bg-gray-100 text-gray-700"
                }`}
              >
                {booking.status.toUpperCase()}
              </p>

              <div className="mt-4 flex flex-col gap-2">
                {["waiting", "confirmed"].includes(booking.status) && (
                  <div className="flex gap-2">
                    <Button onClick={() => handleList(booking)} className="w-full" size="sm">
                      List
                    </Button>
                    <Button
                      onClick={() => handleSwitchClick(booking)}
                      className="w-full"
                      size="sm"
                    >
                      Switch Trip
                    </Button>
                  </div>
                )}

                {!["cancelled", "failed", "expired"].includes(booking.status) && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => handleCancel(booking.booking_id)}
                    disabled={cancelledId === booking.booking_id}
                  >
                    {cancelledId === booking.booking_id ? "Cancelling..." : "Cancel"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};

export default MyBookings;
