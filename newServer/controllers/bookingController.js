import { DateTime } from "luxon";
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

    if (!booking) {
      return res
        .status(400)
        .json({ message: "This booking doesn't exist!", booking: booking });
    }

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
  const userId = req.session.userId;
  try {
    //Query

    const getBookingInfo = `
    SELECT *
    FROM booking
    WHERE passenger_id = $1 
    ORDER BY priority ASC, booked_at DESC
    `;

    const { rows: userBookings } = await pool.query(getBookingInfo, [userId]);

    if (!userBookings) {
      return res.status(400).json({ message: "No booking found with this ID" });
    }

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
    const checkTrip = `SELECT * FROM trips WHERE trip_id = $1`;
    const { rows: trip } = await pool.query(checkTrip, [tripId]);
    if (!trip) {
      return res.status(400).json("This trip doesn't exist!");
    }

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
    const checkBus = `SELECT * FROM bus WHERE bus_id = $1`;
    const { rows: bus } = await pool.query(checkTrip, [busId]);
    if (!bus) {
      return res.status(400).json("This bus doesn't exist!");
    }

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
  const {tripId , stopId} = req.body;
  try{
    const checkQuery = `select * from booking where status = $1`;
    const checkBooking = await pool.query(checkQuery, ["pending"]);
    if (checkBooking.rows.length > 0) {
      return res
        .status(400)
        .json(
          "You have pending booking to book another seat you must complete the pending!"
        );
    }
    const passengerId = req.session.userId
    const addQuery = 
    `insert into booking (trip_id, passenger_id, stop_id)
    values($1,$2,$3)
    Returning*`;
    const addBook = await pool.query(addQuery, [tripId, passengerId, stopId]);
    return res
      .status(200)
      .json({ message: "Booked successfuly!", booked: addBook.rows[0] });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
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
    
    `;
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
