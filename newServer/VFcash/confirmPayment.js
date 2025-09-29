// import { func } from 'joi'
// import formatDateAndTime from "../../client/src/formatDateAndTime";

export const confirmVfPayment = async (client, bookingId) => {
  try {
    await client.query("BEGIN");
    // Update payment with idempotence check

    // Update payment
    const paymentUpdate = await client.query(
      `UPDATE payment
       SET payment_status = $1,
           updated_at = NOW()
       WHERE booking_id = $2
         AND payment_status = 'pending'
         OR payment_status = 'rejected'
       RETURNING payment_id`,
      ["confirmed", bookingId]
    );

    if (paymentUpdate.rowCount === 0) {
      await client.query("ROLLBACK");
      const err = new Error("Payment already processed or not found");
      err.status = 409;
      throw err;
    }

    //Update booking
    // const bookingId = paymentUpdate.rows[0].booking_id;
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
      payment: paymentUpdate,
      booking: bookingRows,
      ticket: ticket,
    };
  } catch (err) {
    throw err;
  }
};
