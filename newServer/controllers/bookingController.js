import pool from "../db.js";
// Booking Controller Template
// Implement each function as needed for your business logic

async function getBookings(req, res) {
  // TODO: Fetch all bookings
  try {
    const fetchAll = `
    SELECT *
    FROM booking
    ORDER BY priority ASC, booked_at DESC; 
    `;

    const { rows: bookings } = await pool.query(fetchAll);
    return res
      .status(200)
      .json({ message: "Successfully fetched bookings", bookings: bookings });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error fetching bookings", error: err.message });
  }
}

async function getBookingInfo(req, res) {
  // TODO: Fetch booking info by bookingId
  const bookingId = req.params.bookingId;
  try {
    //Query
    const getBookingInfo = `
    SELECT *
    FROM booking
    WHERE booking_id = $1 
    `;

    const { rows: booking } = await pool.query(getBookingInfo, [bookingId]);
    return res
      .status(200)
      .json({ message: "Successfully fetched bookings", booking: booking });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error fetching bookings", error: err.message });
  }
}

async function getUserBookings(req, res) {
  // TODO: Fetch bookings for a specific user
  const userId = req.params.userId;
  try {
    //Query
    const getBookingInfo = `
    SELECT *
    FROM booking
    WHERE user_id = $1 
    ORDER BY priority ASC, booked_at DESC
    `;

    const { rows: userBookings } = await pool.query(getBookingInfo, [userId]);
    return res.status(200).json({
      message: "Successfully fetched bookings",
      userBookings: userBookings,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error fetching bookings", error: err.message });
  }
}

async function getTripBookings(req, res) {
  // TODO: Fetch bookings for a specific trip
  const tripId = req.params.tripId;
  try {
    //Query
    const getBookingInfo = `
    SELECT *
    FROM booking
    WHERE trip_id = $1 
    ORDER BY priority ASC, booked_at DESC
    `;

    const { rows: tripBookings } = await pool.query(getBookingInfo, [tripId]);
    return res.status(200).json({
      message: "Successfully fetched bookings",
      tripBookings: tripBookings,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error fetching bookings", error: err.message });
  }
}

async function getBusBookings(req, res) {
  // TODO: Fetch bookings for a specific trip
  const busId = req.params.busId;
  try {
    //Query
    const getBookingInfo = `
    SELECT *
    FROM booking
    WHERE bus_id = $1 
    ORDER BY priority ASC, booked_at DESC
    `;

    const { rows: busBookings } = await pool.query(getBookingInfo, [busId]);
    return res.status(200).json({
      message: "Successfully fetched bookings",
      busBookings: busBookings,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error fetching bookings", error: err.message });
  }
}

async function book(req, res) {
  // TODO: Create a new booking
  res.status(501).json({ message: "Not implemented" });
}

async function confirmBooking(req, res) {
  // TODO: Handle booking confirmation webhook
  res.status(501).json({ message: "Not implemented" });
}

async function updateBooking(req, res) {
  // TODO: Update booking details
  const bookingId = req.params.bookingId;
  try {
    //Query
    const getBookingInfo = `
    SELECT *
    FROM booking
    WHERE booking_id = $1 
    `;

    const { rows: booking } = await pool.query(getBookingInfo, [bookingId]);

    if (!booking) {
      return res
        .status(200)
        .json({ message: "No booking found with this ID", booking: booking });
    }

    const updateBookingStatus = `
    
    `
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error fetching bookings", error: err.message });
  }
}

async function cancel(req, res) {
  // TODO: Cancel a booking
  res.status(501).json({ message: "Not implemented" });
}

export default {
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
