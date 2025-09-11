// import { func } from 'joi'
import formatDateAndTime from "../../../client/src/formatDateAndTime.js";

export const standaloneUpdate = async (
  client,
  newStatus,
  transactionId,
  paymentMethod,
  amount_cents,
  paymentId
) => {
  try {
    await client.query("BEGIN");
    // Update payment with idempotence check
    const amountCents = Number(amount_cents);
    if (isNaN(amountCents)) {
      throw new Error("Invalid amount in webhook payload");
    }

    const amount = Math.floor(amountCents / 100);

    // Update payment
    const paymentUpdate = await client.query(
      `UPDATE payment
       SET payment_status = $1,
           transaction_id = $2,
           payment_method = $3,
           amount = $4,
           captured_status = 'capture',
           updated_at = NOW()
       WHERE payment_id = $5
         AND payment_status = 'pending'
       RETURNING booking_id`,
      [newStatus, transactionId, paymentMethod, amount, paymentId]
    );

    if (paymentUpdate.rowCount === 0) {
      await client.query("ROLLBACK");
      const err = new Error("Payment already processed or not found");
      err.status = 409;
      throw err;
    }

    //Update booking
    const bookingId = paymentUpdate.rows[0].booking_id;
    const { rows: bookingRows } = await client.query(
      `UPDATE booking
         SET status = $1,
             priority = $2,
             updated_at = NOW()
         WHERE booking_id = $3`,
      ["confirmed", 1, bookingId]
    );

    // Create and send ticket email
    const getTicketQ = `
          SELECT 
            booking.booking_id,
            tickets.ticket_id,
            users.username,
            tickets.seat_number,
            trips.date,
            trips.departure_time,
            trips.price,
            route.source,
            route.destination,
            stop.stop_name
          FROM booking
          JOIN trips 
            ON booking.trip_id = trips.trip_id 
          JOIN users 
            ON booking.passenger_id = users.user_id
          JOIN tickets 
            ON booking.booking_id = tickets.booking_id 
          LEFT JOIN route 
            ON trips.route_id = route.route_id
          LEFT JOIN stop 
            ON booking.stop_id = stop.stop_id
          LEFT JOIN seat 
            ON booking.seat_id = seat.seat_id
          WHERE booking.booking_id = $1
          LIMIT 1
          `;
    const { rows: userTicket } = await client.query(getTicketQ, [bookingId]);
    const ticket = userTicket[0];

    // const userEmail = obj.order.shipping_data.email;
    // await sendTicketEmail(userEmail, ticket);
    // await client.query(
    //   "UPDATE tickets SET email_status = 'sent', email_sent_at = NOW(), updated_at = NOW(), status = 'issued' WHERE booking_id = $1",
    //   [bookingId]
    // );
    await client.query("COMMIT");
    return {
      payment: paymentUpdate[0],
      booking: bookingRows[0],
      ticket: ticket,
    };
  } catch (err) {
    throw err;
  }
};
