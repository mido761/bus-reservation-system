import { DateTime } from "luxon";
import pool from "../db.js";
import axios from "axios";
import { PaymobClient } from "../paymob/paymobClient.js";
import { waitingList } from "../paymob/waitingList.js";

async function getBookings(req, res) {
  // TODO: Fetch all bookings
  try {
    const fetchAll = `
      SELECT *
      FROM booking
      ORDER BY priority ASC, updated_at DESC; 
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
      payment.payment_id,
      payment.amount,
      trips."date",
      trips.price,
      route.source,
      route.destination,
      stop.stop_id,
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
    LEFT JOIN payment 
      ON booking.booking_id = payment.booking_id
    WHERE booking.passenger_id = $1
    ORDER BY booking.updated_at DESC
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

async function getPassengerList(req, res) {
  try {
    // const { tripId } = req.params.tripId;
    const tripId = req.params.tripId;
    const userId = req.session.userId;
    console.log("Trip ID:", tripId, "User ID:", userId);

    // 1️⃣ Check if trip exists
    const tripResult = await pool.query(
      "SELECT * FROM trips WHERE trip_id = $1;",
      [tripId]
    );

    if (tripResult.rows.length === 0) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // 2️⃣ Fetch all passengers for this trip (joined with user and stop)
    const result = await pool.query(
      `SELECT 
          b.passenger_id,
          u.username,
          u.phone_number,
          s.stop_name
       FROM 
          booking b
       JOIN 
          users u 
          ON b.passenger_id = u.user_id
       JOIN 
          stop s 
          ON b.stop_id = s.stop_id
       WHERE 
          b.trip_id = $1
       ORDER BY 
          b.updated_at ASC;`,
      [tripId]
    );

    const passengers = result.rows;

    if (passengers.length === 0) {
      return res.status(200).json({ message: "No passengers found", data: [] });
    }

    // 3️⃣ Map results: show details only for the given user
    const passengerList = passengers.map((p, index) => {
      //  const passengerId = p.passenger_id ? p.passenger_id.toString() : null;
      console.log(p.passenger_id, userId)
      if (p.passenger_id.toString()=== userId.toString()) {
        return {
          position: index + 1,
          username: p.username,
          phone_number: p.phone_number,
          stop_name: p.stop_name,
        };
      } else {
        return index + 1; // just show index number
      }
    });

    // 4️⃣ Return formatted list
    res.status(200).json({
      message: "Passenger list fetched successfully",
      data: passengerList,
    });

  } catch (err) {
    console.error("Error fetching passenger list:", err);
    res.status(500).json({
      message: "Error fetching passenger list",
      error: err.message,
    });
  }
}

async function manualConfirm(req, res) {
  const client = await pool.connect(); // get a dedicated client for the transaction
  try {
    const { bookings } = req.body;

    await client.query('BEGIN'); // start transaction

    const updateQ = `
      UPDATE booking
      SET status = $1
      WHERE booking_id = $2
      RETURNING *
    `;

    const updatedBookings = [];

    for (let i = 0; i < bookings.length; i++) {
      const b = bookings[i];
      const result = await client.query(updateQ, [b.status, b.booking_id]);
      updatedBookings.push(result.rows[0]);
    }

    await client.query('COMMIT'); // commit all changes if successful

    res.status(200).json({
      message: "Bookings updated successfully",
      updated: updatedBookings,
    });

  } catch (err) {
    await client.query('ROLLBACK'); // undo all changes if any error occurs
    res.status(500).json({
      message: "Error updating bookings list",
      error: err.message,
    });
  } finally {
    client.release(); // release connection back to pool
  }
}

async function getDriverList(req,res){
  const tripId = req.params.tripId;
  try {
    const checkTrip = `SELECT * FROM trips WHERE trip_id = $1`;
    const { rows: trip } = await pool.query(checkTrip, [tripId]);
    if (!trip) {
      return res.status(400).json("This trip doesn't exist!");
    }

    const getBookingInfo = `
    SELECT 
        b.booking_id,
        b.status,
        b.booked_at,
        b.updated_at, 
        s.stop_name, 
        u.username AS user_name, 
        u.phone_number AS user_number
    FROM 
        booking b
    JOIN 
        stop s 
        ON b.stop_id = s.stop_id
    JOIN 
        users u 
        ON b.passenger_id = u.user_id
    WHERE 
        b.trip_id = $1
        AND b.status IN ('confirmed', 'waiting')
    ORDER BY 
        b.updated_at DESC;

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

async function filterUserBookings(req, res) {
  const userId = req.session.userId;
  const { tripId } = req.body;
  try {
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
    ORDER BY booking.updated_at DESC
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
  const tripId = req.params.tripId;
  try {
    const checkTrip = `SELECT * FROM trips WHERE trip_id = $1`;
    const { rows: trip } = await pool.query(checkTrip, [tripId]);
    if (!trip) {
      return res.status(400).json("This trip doesn't exist!");
    }

    const getBookingInfo = `
    SELECT *
    FROM booking
    WHERE trip_id = $1 
    ORDER BY priority ASC, updated_at DESC
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
  const busId = req.params.busId;
  try {
    const checkBus = `SELECT * FROM bus WHERE bus_id = $1`;
    const { rows: bus } = await pool.query(checkTrip, [busId]);
    if (!bus) {
      return res.status(400).json("This bus doesn't exist!");
    }

    const getBookingInfo = `
    SELECT *
    FROM booking
    WHERE bus_id = $1 
    ORDER BY priority ASC, updated_at DESC
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
async function getTripPassengers(req, res) {
  const tripId = req.params.tripId;
  try {
    // Check if trip exists with route information
    const checkTrip = `
    SELECT 
      t.*,
      r.source,
      r.destination,
      r.distance,
      r.estimated_duration
    FROM trips t
    LEFT JOIN route r ON t.route_id = r.route_id
    WHERE t.trip_id = $1
    `;
    const { rows: trip } = await pool.query(checkTrip, [tripId]);
    if (!trip.length) {
      return res.status(400).json({ message: "This trip doesn't exist!" });
    }

    // Get passengers with their details and payment status
    const getPassengersQuery = `
    SELECT 
      u.user_id,
      u.username as name,
      u.phone_number,
      u.email,
      b.booking_id,
      b.status as booking_status,
      b.booked_at,
      b.priority,
      p.payment_id,
      p.payment_status,
      p.amount,
      s.seat_number,
      st.stop_name,
      st.stop_id,
      t.date,
      t.departure_time,
      t.arrival_time,
      r.source,
      r.destination
    FROM booking b
    JOIN users u ON b.passenger_id = u.user_id
    LEFT JOIN payment p ON b.booking_id = p.booking_id
    LEFT JOIN seat s ON b.seat_id = s.seat_id
    LEFT JOIN stop st ON b.stop_id = st.stop_id
    JOIN trips t ON b.trip_id = t.trip_id
    LEFT JOIN route r ON t.route_id = r.route_id
    WHERE b.trip_id = $1
    ORDER BY b.updated_at DESC
    `;

    const { rows: passengers } = await pool.query(getPassengersQuery, [tripId]);

    // Calculate passenger counts by stop
    const stopCounts = {};
    passengers.forEach((passenger) => {
      const stopName = passenger.stop_name || "Unknown Stop";
      stopCounts[stopName] = (stopCounts[stopName] || 0) + 1;
    });

    return res.status(200).json({
      message: "Successfully fetched passengers",
      passengers: passengers,
      tripInfo: trip[0],
      totalPassengers: passengers.length,
      stopCounts: stopCounts,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error fetching passengers", error: err.message });
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
      JOIN stop s 
        ON b.stop_id = s.stop_id
      WHERE b.status = $1 
        AND b.passenger_id = $2 
        AND b.trip_id = $3 
    `;

    const bookings = await client.query(checkQuery, [
      "waiting",
      req.session.userId,
      tripId,
    ]);
    // console.log(bookings.rows);
    const bookingsCount = bookings.rowCount;

    // if (bookingsCount > 1) {
    //   await client.query("ROLLBACK");
    //   return res.status(400).json({
    //     message: "Only two bookings allowed!",
    //     booking: bookings.rows,
    //   });
    // }

    const passengerId = req.session.userId;
    // console.log("Passenger:", passengerId);

    // Insert into booking
    const addQuery = `
      WITH inserted AS (
        INSERT INTO booking (trip_id, passenger_id, stop_id, status)
        VALUES ($1, $2, $3, 'waiting')
        RETURNING *
      )
      SELECT i.*, s.stop_name, s.location
      FROM inserted i
      JOIN stop s ON i.stop_id = s.stop_id
    `;

    const { rows: addBookingRows } = await client.query(addQuery, [
      tripId,
      passengerId,
      stopId,
    ]);

    // console.log(addBookingRows[0]);

    // Insert into tickets linked to booking
    const addticketQ = `
        INSERT INTO tickets (booking_id)
        VALUES ($1)
        RETURNING *`;
    const ticket = await client.query(addticketQ, [addBookingRows[0].booking_id]);

    const waiting = await waitingList(tripId, client);

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Booked successfully!",
      booked: addBookingRows[0],
      ticket: ticket.rows[0],
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Booking transaction failed:", error);
    return res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
}
async function switchbooking(req, res) {
  const { newTripId, newStopId, bookingId } = req.body;
  const client = await pool.connect();
  try {
    // console.log(newTripId, newStopId,bookingId)
    await client.query("BEGIN");
    // Check if user already has pending booking
    const checkQuery = `
      SELECT b.*, s.stop_name, s.location
      FROM booking b
      JOIN stop s 
        ON b.stop_id = s.stop_id
      WHERE b.booking_id = $1 
    `;

    const booking = await client.query(checkQuery, [
      bookingId,
    ]);
    // console.log(bookings.rows);
    const bookingsCount = booking.rowCount;
    const oldTripId = booking.rows[0].trip_id;
    if (bookingsCount < 1) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "you don't have this booking to switch it",
        booking: booking.rows,
      });
    }

    const updateBookingQ = `
    update booking 
    set trip_id = $1 , stop_id = $2 , updated_at = NOW()
    where booking_id = $3
    Returning *
    `
    const { rows: updateBooking } = await client.query(updateBookingQ, [newTripId, newStopId, bookingId])
    console.log(updateBooking)

    await waitingList(oldTripId, client); // Old trip update
    await waitingList(newTripId, client); // New trip update


    await client.query("COMMIT");

    return res.status(201).json({
      message: "Booked successfully!",
      updateBooking: updateBooking
    });


  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
async function confirmBooking(req, res) {
  // TODO: Handle booking confirmation webhook
  res.status(501).json({ message: "Not implemented" });
}

async function updateBooking(req, res) {
  const bookingId = req.params.bookingId;
  try {
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
  const { bookingId } = req.body;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const getBookingInfo = `
      SELECT b.*, p.*
      FROM booking b
      LEFT JOIN payment p ON b.booking_id = p.booking_id
          AND (p.payment_status = 'pending' OR p.payment_status = 'paid')
      WHERE b.booking_id = $1;
    `;

    const { rows: booking } = await client.query(getBookingInfo, [bookingId]);
    console.log(booking[0]);

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

    {// Paymob CLient
      // const paymob = new PaymobClient({
      //   publicKey: process.env.PUBLIC_KEY,
      //   secretKey: process.env.SECRET_KEY,
      //   apiKey: process.env.API_KEY,
      // });
      // [];

      // const token = await paymob.fetchAuthToken();

      // try {
      //   txnDetails = await paymob.getTxn(token, "merchant_order_id", paymentId);

      //   transactionId = txnDetails.id || null;
      //   amount = txnDetails.amount_cents / 100 || null;
      //   paymob_payment_status = txnDetails.order.payment_status || null;
      //   paymob_refund_status = txnDetails.data.migs_order.status || null;
      //   console.log("Transaction details: ", txnDetails);
      //   console.log("Payment status: ", paymob_payment_status);
      //   console.log("Refund status: ", paymob_refund_status);
      //   console.log("Amount: ", amount);
      // } catch (err) {
      //   console.log("Txn Not Found!");
      // }

      // if (txnDetails.is_refunded)

      // Automatic: Refund the transaction if it's a paid standalone or captured
      // if (
      //   paymob_payment_status === "PAID" &&
      //   paymentStatus !== "refunded" &&
      //   paymob_refund_status !== "REFUNDED"
      // ) {
      //   const transactionId = txnDetails?.id || null;
      //   // const amount = booking[0].amount;
      //   const refundRes = await paymob.refund(transactionId, amount);
      //   console.log("Refund res: ", refundRes);
      // }

      // Void the transaction if it is only authorized
      // if (paymentStatus === "authorized") {
      //   const transactionId = booking[0].transaction_id;
      //   const voidRes = await paymob.void(transactionId);
      //   console.log("Void res: ", voidRes);
      // }
    }

    // Only cancel pending or confirmed bookings
    if (!["failed", "expired", "cancelled"].includes(bookingStatus)) {
      const cancelBookingQ = `
        UPDATE booking
        SET status = $1, updated_at = NOW(), priority = $2
        WHERE booking_id = $3
          AND (status = 'confirmed' OR status = 'pending' OR status = 'waiting')
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

    const waiting = await waitingList(booking[0].trip_id, client);

    // refund algo
    {// if (paymentId) {
      //   // Payment update Query
      //   const updatePaymentQ = `
      //     UPDATE payment
      //     SET payment_status = $1, updated_at = NOW()
      //     WHERE booking_id = $2
      //       AND (payment_status = 'pending' OR payment_status = 'paid' ) 
      //     RETURNING payment_id, payment_status, amount
      //   `;

      //   const updatedPayment = await client.query(updatePaymentQ, [
      //     "cancelled",
      //     bookingId,
      //   ]);

      //   console.log("Payment: ", updatedPayment.rows);
      //   if (!updatedPayment.rowCount) {
      //     await client.query("ROLLBACK");
      //     throw new Error("Can't update payment!");
      //   }

      //   // Payment update Query
      //   const requestRefundQ = `
      //     INSERT INTO refund (payment_id, amount, status)
      //     VALUES ($1, $2, 'pending')
      //   `;

      // const refundReq = await client.query(requestRefundQ, [
      //   paymentId,
      //   amount,
      // ]);

      // console.log("Refund: ", refundReq.rows);
      // if (!refundReq.rowCount) {
      //   await client.query("ROLLBACK");
      //   throw new Error("Can't issue refund request!");
      // }
    }

    await client.query("COMMIT");
    return res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.log("Cancellation error: ", err);
    return res
      .status(500)
      .json({ message: "Error cancel bookings", error: err });
  } finally {
    client.release();
  }
}

export {
  getBookings,
  getDriverList,
  getBookingInfo,
  getPassengerList,
  getUserBookings,
  filterUserBookings,
  getTripBookings,
  getBusBookings,
  getTripPassengers,
  book,
  confirmBooking,
  updateBooking,
  switchbooking,
  cancel,

};
