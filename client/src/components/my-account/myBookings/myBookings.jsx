import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // ✅ Import Button
import { toast } from "react-toastify";
import formatDateAndTime from "../../../formatDateAndTime";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const statusStyles = {
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  pending: "bg-blue-100 text-blue-800",
};

const MyBookings = () => {
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">My Bookings</h2>

      <div className="grid gap-6 md:grid-cols-2">
        {bookings.map((booking, idx) => (
          <Card
            key={booking.booking_id || idx}
            className="shadow-sm hover:shadow-md transition p-4 rounded-lg"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">
                {booking.source} → {booking.destination}
              </CardTitle>
              <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <span>📅</span>
                <span>{formatDateAndTime(booking.date, "date")}</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-2 text-sm text-gray-600">
              <div>
                <strong>Stop: </strong>
                {booking.stop_name}
              </div>
              <div className="flex justify-between items-center">
                <span>
                  <strong>Status: </strong>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      statusStyles[booking.status] ||
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {booking.status.toUpperCase()}
                  </span>
                </span>
              </div>
              <div>
                <strong>Booked At: </strong>
                {formatDateAndTime(booking.booked_at, "dateTime")}
              </div>
              <div>
                <strong>Last Update: </strong>
                {formatDateAndTime(booking.updated_at, "dateTime")}
              </div>

              {/* Delete Button */}
              <div className="pt-10 flex justify-center gap-4">
                {booking.status === "pending" && (
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() => handleComplete(booking.booking_id)}
                    disabled={cancelledId === booking.booking_id}
                  >
                    {cancelledId === booking.booking_id
                      ? "Complete..."
                      : "Complete"}
                  </Button>
                )}

                {!["cancelled", "failed", "expired"].includes(
                  booking.status
                ) && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleCancel(booking.booking_id)}
                    disabled={cancelledId === booking.booking_id}
                  >
                    {cancelledId === booking.booking_id
                      ? "Canceling..."
                      : "Cancel"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyBookings;
