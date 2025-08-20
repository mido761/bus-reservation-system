import express from "express";
import { getBookings, getBookingInfo, getUserBookings, getTripBookings, getBusBookings, book, confirmBooking, updateBooking, cancel } from "../controllers/bookingController.js";

const router = express.Router();


router.get('/get-all-bookings', getBookings);
router.get('/booking-info/:bookingId', getBookingInfo);
router.get('/get-user-bookings/:userId', getUserBookings);
router.get('/get-trip-bookings/:tripId', getTripBookings);
router.get('/get-bus-bookings/:busId', getBusBookings);
router.post('/book', book);
router.post('/webhook', confirmBooking);
router.put('/update-booking', updateBooking);
router.delete('/cancel-booking', cancel);


export default router;