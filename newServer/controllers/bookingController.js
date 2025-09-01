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
    // SELECT *
    // FROM booking
    // WHERE passenger_id = $1
    // ORDER BY priority ASC, booked_at DESC

    const getBookingInfo = `
    SELECT 
      booking.booking_id,
      trips.date,
      trips.price,
      route.source,
      route.destination,
      stop.stop_name,
      seat.seat_number,
      booking.status,
      booking.booked_at,
      booking.updated_at
    FROM booking
    JOIN trips 
      ON booking.trip_id = trips.trip_id 
    LEFT JOIN route 
      ON trips.route_id = route.route_id
    LEFT JOIN stop 
      ON booking.stop_id = stop.stop_id
    LEFT JOIN seat 
      ON booking.seat_id = seat.seat_id
    WHERE booking.passenger_id = $1
    ORDER BY booking.booked_at DESC
    `;

    const { rows: userBookings } = await pool.query(getBookingInfo, [userId]);

    if (!userBookings.length) {
      return res
        .status(400)
        .json({ message: "No bookings found for this user!" });
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

async function filterUserBookings(req, res) {
  // TODO: Fetch bookings for a specific user
  const userId = req.session.userId;
  const { tripId } = req.body;
  try {
    //Query
    // SELECT *
    // FROM booking
    // WHERE passenger_id = $1
    // ORDER BY priority ASC, booked_at DESC

    const getBookingInfo = `
    SELECT 
      booking.booking_id,
      trips.date,
      trips.price,
      route.source,
      route.destination,
      stop.stop_name,
      seat.seat_number,
      booking.status,
      booking.booked_at,
      booking.updated_at
    FROM booking
    JOIN trips 
      ON booking.trip_id = trips.trip_id 
    LEFT JOIN route 
      ON trips.route_id = route.route_id
    LEFT JOIN stop 
      ON booking.stop_id = stop.stop_id
    LEFT JOIN seat 
      ON booking.seat_id = seat.seat_id
    WHERE booking.passenger_id = $1 AND booking.trip_id = $2
    ORDER BY booking.booked_at DESC
    `;

    const { rows: userBookings } = await pool.query(getBookingInfo, [
      userId,
      tripId,
    ]);

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
    const checkQuery = `
    SELECT b.*, s.stop_name, s.location
    FROM booking b
    JOIN stop s ON b.stop_id = s.stop_id
    WHERE b.status = $1 
      AND b.passenger_id = $2 
      AND b.trip_id = $3 
  `;

    const { rows } = await client.query(checkQuery, [
      "pending",
      req.session.userId,
      tripId,
    ]);
    console.log(rows);
    const checkBooking = rows[0];

    if (checkBooking) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message:
          "You have a pending booking. Complete it before booking another seat!",
        booking: checkBooking,
      });
    }
    if (!checkBooking) {
      const passengerId = req.session.userId;
      console.log("Passenger:", passengerId);

      // Insert into booking
      const addQuery = `
      WITH inserted AS (
        INSERT INTO booking (trip_id, passenger_id, stop_id, status)
        VALUES ($1, $2, $3, 'pending')
        RETURNING *
      )
      SELECT i.*, s.stop_name, s.location
      FROM inserted i
      JOIN stop s ON i.stop_id = s.stop_id
    `;

      const { rows } = await client.query(addQuery, [
        tripId,
        passengerId,
        stopId,
      ]);
      const addBook = rows[0];
      console.log(addBook);

      // Insert into tickets linked to booking
      const addticketQ = `
        INSERT INTO tickets (booking_id)
        VALUES ($1)
        RETURNING *`;
      const ticket = await client.query(addticketQ, [
        addBook.booking_id,
      ]);

      await client.query("COMMIT");

      return res.status(201).json({
        message: "Booked successfully!",
        booked: addBook,
        ticket: ticket.rows[0],
      });
    }
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
  filterUserBookings,
  getTripBookings,
  getBusBookings,
  book,
  confirmBooking,
  updateBooking,
  cancel,
};
