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
  const { tripId, stopId } = req.body;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check if user already has pending booking
    const checkQuery = `SELECT * FROM booking WHERE status = $1 AND passenger_id = $2`;
    const checkBooking = await client.query(checkQuery, ["pending", req.session.userId]);

    // if (checkBooking.rows.length > 0) {
    //   await client.query("ROLLBACK");
    //   return res.status(400).json(
    //     "You have a pending booking. Complete it before booking another seat!"
    //   );
    // }

    const passengerId = req.session.userId;
    console.log("Passenger:", passengerId);

    // Insert into booking
    const addQuery = `
      INSERT INTO booking (trip_id, passenger_id, stop_id, status)
      VALUES ($1, $2, $3, 'pending')
      RETURNING *`;
    const addBook = await client.query(addQuery, [tripId, passengerId, stopId]);

    // Insert into payment linked to booking
    const addPaymentQ = `
      INSERT INTO payment (booking_id, payment_status)
      VALUES ($1, 'pending')
      RETURNING *`;
    const addPayment = await client.query(addPaymentQ, [addBook.rows[0].booking_id]);

    await client.query("COMMIT");

    return res.status(200).json({
      message: "Booked successfully!",
      booked: addBook.rows[0],
      payment: addPayment.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Booking transaction failed:", error);
    return res.status(500).json({ message: error.message });
  } finally {
    client.release();
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
