import express from "express";
import {
  getBookings,
  getBookingInfo,
  getUserBookings,
  filterUserBookings,
  getTripBookings,
  getBusBookings,
  // getTripPassengers,
  // getTripsWithPassengerCounts,
  book,
  confirmBooking,
  updateBooking,
  cancel,
} from "../controllers/bookingController.js";

const router = express.Router();

router.get("/get-all-bookings", getBookings);
router.get("/booking-info/:bookingId", getBookingInfo);
router.get("/get-user-bookings", getUserBookings);
router.post("/filter-user-bookings", filterUserBookings);
router.get("/get-trip-bookings/:tripId", getTripBookings);
router.get("/get-bus-bookings/:busId", getBusBookings);
// router.get("/get-trip-passengers/:tripId", getTripPassengers);
// router.get("/get-trips-with-counts", getTripsWithPassengerCounts);
router.post("/book", book);
router.post("/webhook", confirmBooking);
router.put("/update-booking", updateBooking);
router.post("/cancel-booking", cancel);

export default router;
