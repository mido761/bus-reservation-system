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
    <>
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
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      statusStyles[booking.status] ||
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

              {/* Delete Button */}

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

              {!["cancelled", "failed", "expired"].includes(booking.status) && (
                <div className="w-full pt-4 flex justify-center gap-4">
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
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};

export default MyBookings;
