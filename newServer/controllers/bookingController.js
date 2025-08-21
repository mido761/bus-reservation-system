import { DateTime } from "luxon";
import pool from "../db.js"

// Booking Controller Template
// Implement each function as needed for your business logic

async function getBookings(req, res) {
  // TODO: Fetch all bookings
  res.status(501).json({ message: "Not implemented" });
}

async function getBookingInfo(req, res) {
  // TODO: Fetch booking info by bookingId
  res.status(501).json({ message: "Not implemented" });
}

async function getUserBookings(req, res) {
  // TODO: Fetch bookings for a specific user
  res.status(501).json({ message: "Not implemented" });
}

async function getTripBookings(req, res) {
  // TODO: Fetch bookings for a specific trip
  res.status(501).json({ message: "Not implemented" });
}

async function getBusBookings(req, res) {
  // TODO: Fetch bookings for a specific trip
  res.status(501).json({ message: "Not implemented" });
}

async function book(req, res) {
  // TODO: Create a new booking
  const {tripId , passengerId, stopId} = req.body;
  try{
    const checkQuery = `select * from booking where status = $1`;
    const checkBooking = await pool.query(checkQuery,['pending']);
    if(checkBooking.rows.length > 0){
      return res.status(400).json("You have pending booking to book another seat you must complete the pending!");
    }
    const addQuery = 
    `insert into booking (trip_id, passenger_id, stop_id)
    values($1,$2,$3)
    Returning*`; 
    const addBook = await pool.query(addQuery, [tripId , passengerId, stopId]);
    return res.status(200).json({message:("Booked successfuly!"), booked:addBook.rows[0]});
  }catch(error){
      return res.status(500).json({ message: error.message });
  }
  res.status(501).json({ message: "Not implemented" });
}

async function confirmBooking(req, res) {
  // TODO: Handle booking confirmation webhook
  res.status(501).json({ message: "Not implemented" });
}

async function updateBooking(req, res) {
  // TODO: Update booking details
  res.status(501).json({ message: "Not implemented" });
}

async function cancel(req, res) {
  // TODO: Cancel a booking
  res.status(501).json({ message: "Not implemented" });
}

export {
  getBookings,
  getBookingInfo,
  getUserBookings,
  getTripBookings,
  getBusBookings,
  book,
  confirmBooking,
  updateBooking,
  cancel,
};