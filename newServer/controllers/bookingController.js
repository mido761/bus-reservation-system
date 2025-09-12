import { DateTime } from "luxon";
import pool from "../db.js";
import axios from "axios";
import { PaymobClient } from "../helperfunctions/paymob/paymobClient.js";

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
        message: "Complete pending booking first!",
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
      const ticket = await client.query(addticketQ, [addBook.booking_id]);

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
  const { bookingId } = req.body;
  const client = await pool.connect();
  let paymob_payment_status, paymob_refund_status, amount;
  try {
    await client.query("BEGIN");

    //Query
    const getBookingInfo = `
      SELECT b.*, p.*
      FROM booking b
      LEFT JOIN payment p ON b.booking_id = p.booking_id
      WHERE b.booking_id = $1;
    `;

    const { rows: booking } = await client.query(getBookingInfo, [bookingId]);
    console.log(booking);

    if (!booking) {
      await client.query("ROLLBACK");
      return res
        .status(200)
        .json({ message: "No booking found with this ID", booking: booking });
    }

    const bookingStatus = booking[0]?.status;
    const paymentStatus = booking[0]?.payment_status;
    const paymentId = booking[0]?.payment_id;
    const amount = booking[0]?.amount;
    console.log("paymentId: ", paymentId);
    console.log("Amount In payment: ", amount);

    // Stop if the booking is cancelled already
    if (bookingStatus === "cancelled") {
      return res
        .status(200)
        .json({ message: "Booking already cancelled!", booking: booking });
    }

    // Paymob CLient
    const paymob = new PaymobClient({
      publicKey: process.env.PUBLIC_KEY,
      secretKey: process.env.SECRET_KEY,
      apiKey: process.env.API_KEY,
    });
    [];

    const token = await paymob.fetchAuthToken();

    try {
      const txnDetails = await paymob.getTxn(
        token,
        "merchant_order_id",
        paymentId
      );

      amount = txnDetails.amount_cents / 100 || null;
      paymob_payment_status = txnDetails.order.payment_status || null;
      paymob_refund_status = txnDetails.data.migs_order.status || null;
      console.log("Transaction details: ", txnDetails);
      console.log("Payment status: ", paymob_payment_status);
      console.log("Refund status: ", paymob_refund_status);
      console.log("Amount: ", amount);
    } catch (err) {
      console.log("Txn Not Found!");
    }

    // if (txnDetails.is_refunded)

    // Refund the transaction if it's a paid standalone or captured
    if (
      paymob_payment_status === "PAID" &&
      paymentStatus !== "refunded" &&
      paymob_refund_status !== "REFUNDED"
    ) {
      const transactionId = txnDetails?.id || null;
      // const amount = booking[0].amount;
      const refundRes = await paymob.refund(transactionId, amount);
      console.log("Refund res: ", refundRes);
    }

    // Void the transaction if it is only authorized
    if (paymentStatus === "authorized") {
      const transactionId = booking[0].transaction_id;
      const voidRes = await paymob.void(transactionId);
      console.log("Void res: ", voidRes);
    }

    // Only cancel pending or confirmed bookings
    if (bookingStatus !== "cancelled") {
      // Booking Query
      const cancelBookingQ = `
      UPDATE booking
      SET status = $1, updated_at = NOW(), priority = $2
      WHERE booking_id = $3
        AND (status = 'confirmed' OR status = 'pending' OR status = 'pending')
      RETURNING booking_id, status
    `;

      const cancelledBooking = await client.query(cancelBookingQ, [
        "cancelled",
        null,
        bookingId,
      ]);

      console.log("Booking: ", cancelledBooking.rows);
      if (!cancelledBooking.rowCount) {
        await client.query("ROLLBACK");
        throw new Error("Can't update booking!");
      }
    }

    if (booking[0].payment_id) {
      // Payment update Query
      const cancelPaymentQ = `
        UPDATE payment
        SET payment_status = $1, amount = $2, updated_at = NOW(), captured_status = $3
        WHERE booking_id = $4
          AND payment_status = $5
        RETURNING payment_id, payment_status, amount
      `;

      const cancelledPayment = await client.query(cancelPaymentQ, [
        paymob_refund_status === "REFUNDED" ? "refunded" : "cancelled",
        amount,
        null,
        bookingId,
        paymentStatus,
      ]);

      console.log("Payment: ", cancelledPayment.rows);
      if (!cancelledPayment.rowCount) {
        await client.query("ROLLBACK");
        throw new Error("Can't update payment!");
      }
    }

    // if (booking[0].captured_status === "capture") {
    //   const body = {
    //     transaction_id: booking[0].transaction_id,
    //     amount_cents: booking[0].amount * 100, // still need the calculation for the fee
    //     extras: { ee: 22 },
    //     special_reference: `${booking[0].payment_id}`,
    //     notification_url: `${process.env.BASE_URL}/webhook/refund`,
    //     redirection_url: process.env.WEBHOOK_REDIRECT_URL,
    //   };
    //   const response = await axios.post(
    //     "https://accept.paymob.com/api/acceptance/void_refund/refund",
    //     body,
    //     { headers: { Authorization: `Token ${process.env.SECRET_KEY}` } }
    //   );

    //   return res.status(200).json({
    //     message: "refund sendsuccsfully!",
    //   });
    // }
    //if(booking.captured_status === "auth"){

    // }
    await client.query("COMMIT");
    return res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.log("Cancellation error: ", err);
    return res
      .status(500)
      .json({ message: "Error cancel bookings", error: err });
  }
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
