export const refundUpdate = async (
  client,
  userEmail = null,
  transactionId,
  amount_cents,
  paymentId
) => {
  try {
    await client.query("BEGIN");
    // Check amount
    const amountCents = Number(amount_cents);
    if (isNaN(amountCents)) {
      throw new Error("Invalid amount in webhook payload");
    }

    const amount = Math.floor(amountCents / 100);

    // Update payment with idempotence check
    const paymentUpdate = await client.query(
      `UPDATE payment
       SET payment_status = 'refunded',
           updated_at = NOW()
       WHERE payment_id = $1
            AND (payment_status = 'paid' OR payment_status = 'refunded')
       RETURNING booking_id`,
      [paymentId]
    );

    console.log("Payment: ", paymentUpdate.rows);

    const bookingId = paymentUpdate.rows[0].booking_id;
    console.log("BookingId: ", bookingId)

    if (paymentUpdate.rowCount === 0) {
      await client.query("ROLLBACK");
      return res
        .status(409)
        .json({ error: "Payment already processed or not found" });
    }

    //Insert refund record (new transaction)
    const refundInsert = await client.query(
      `INSERT INTO refund (payment_id, refund_transaction_id, reason, amount, status, created_at)
       VALUES ($1, $2, $3, $4,'refunded', NOW())
       RETURNING refund_id`,
      [paymentId, transactionId, "bec I am", amount]
    );
    console.log("Refund: ", refundInsert.rows);

    const refundId = refundInsert.rows[0].refund_id;

    // Update booking
    const { rows: bookingRows } = await client.query(
      `UPDATE booking
       SET status = 'cancelled',
           priority = NULL,
           updated_at = NOW()
       WHERE booking_id = $1`,
      [bookingId]
    );
    console.log("Booking: ", bookingRows);

    // Update tickets
    const updateTicketQ = `UPDATE tickets
       SET status = 'cancelled',
           updated_at = NOW()
       WHERE booking_id = $1`;
    const { rows: userTicket } = await client.query(updateTicketQ, [bookingId]);
    const ticket = userTicket[0];

    console.log("Ticket: ", userTicket);

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
