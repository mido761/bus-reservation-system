import express from "express";
import authentication from "../middleware/authentication.js";
import {
  getBookings,
  getBookingInfo,
  getDriverList,
  getUserBookings,
  filterUserBookings,
  getTripBookings,
  getBusBookings,
  getTripPassengers,
  getPassengerList,
  book,
  confirmBooking,
  updateBooking,
  switchbooking,
  cancel,
} from "../controllers/bookingController.js";

const router = express.Router();

router.get("/get-all-bookings", authentication.isAuthoraized, getBookings);
router.get("/booking-info/:bookingId",  authentication.isAuthenticated, getBookingInfo);
router.get("/get-user-bookings",  authentication.isAuthenticated, getUserBookings);
router.post("/filter-user-bookings",  authentication.isAuthenticated, filterUserBookings);
router.get("/get-trip-bookings/:tripId", authentication.isAuthenticated, getTripBookings);
router.get("/get-driver-list/:tripId", authentication.isAuthoraized, getDriverList);
router.get("/get-passenger-list/:tripId", authentication.isAuthenticated, getPassengerList);
router.get("/get-bus-bookings/:busId",  authentication.isAuthenticated, getBusBookings);
router.get("/get-trip-passengers/:tripId", authentication.isAuthenticated, getTripPassengers);
router.post("/book", authentication.isAuthenticated, book);
router.post("/switch-booking", authentication.isAuthenticated, switchbooking);
// router.post("/webhook", confirmBooking);
// router.put("/update-booking", updateBooking);
router.post("/cancel-booking", authentication.isAuthenticated, cancel);

export default router;
