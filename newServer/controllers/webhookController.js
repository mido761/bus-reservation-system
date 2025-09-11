import axios from "axios";
import pool from "../db.js";
import hmacVerifier from "../utils/hmacVerifier.js";
import { buildPaymobBody } from "../helperfunctions/paymob/buildPaymobBody.js";
import { findOrCreatePayment } from "../helperfunctions/paymob/findOrCreatePayment.js";
import { handlePaymobError } from "../helperfunctions/paymob/handlePaymobError.js";
import { limitPaymentRetries } from "../helperfunctions/paymob/countPaymentRetries.js";
// import { sendMail } from "../utils/nodeMailer.js";
// import { sendTicketEmail } from "../utils/sendTicketMail.js";
// import {sendRefundEmail} from "../utils/sendRefundMail.js";


const webhookStandalone = async (req, res) => {
  console.log("POST /payment/webhook called");

  const client = await pool.connect();
  try {
    const payload = req.body;
    const obj = payload.obj || {};
    const paymentId = obj.order?.merchant_order_id;
    const transactionId = obj.id;
    const success = obj.success === true || obj.success === "true";

    // Validate
    if (!paymentId || !transactionId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!hmacVerifier(payload, req.query.hmac)) {
      return res.status(400).json({ error: "Invalid HMAC signature" });
    }

    // Determine status
    const newStatus = success ? "paid" : "failed";
    const paymentMethod = `${obj.source_data?.type || "N/A"} | ${
      obj.source_data?.sub_type || "N/A"
    }`;
    console.log(obj.is_refunded)
  //   if(obj.is_refunded){
  //      await client.query("BEGIN");

  //   // Update payment with idempotence check
  //   const paymentUpdate = await client.query(
  //     `UPDATE payment
  //      SET payment_status = 'refunded',
  //          updated_at = NOW()
  //      WHERE payment_id = $1
  //        AND payment_status = 'paid'
  //      RETURNING booking_id`,
  //     [paymentId]
  //   );

  //   if (paymentUpdate.rowCount === 0) {
  //     await client.query("ROLLBACK");
  //     return res
  //       .status(409)
  //       .json({ error: "Payment already refunded or not found" });
  //   }

  //   const bookingId = paymentUpdate.rows[0].booking_id;
  //   const userId = paymentUpdate.rows[0].user_id;
  //   // console.log(obj.amount)
  //   const amountCents = Number(obj.amount_cents);
  //   if (isNaN(amountCents)) {
  //     throw new Error("Invalid amount in webhook payload");
  //   }

  //   const amount = Math.floor(amountCents / 100);
  //   // 2) Insert refund record (new transaction)
  //   const refundInsert = await client.query(
  //     `INSERT INTO refund (payment_id, refund_transaction_id,reason, amount,status, created_at)
  //      VALUES ($1, $2, $3, $4,'refunded', NOW())
  //      RETURNING refund_id`,
  //     [paymentId, transactionId, "bec I am" , amount]
  //   );

  //   const refundId = refundInsert.rows[0].refund_id;

  //   // 3) Update booking
  //   await client.query(
  //     `UPDATE booking
  //      SET status = 'cancelled',
  //          priority = NULL,
  //          updated_at = NOW()
  //      WHERE booking_id = $1`,
  //     [bookingId]
  //   );
  //  // 4) Update tickets
  //   await client.query(
  //     `UPDATE tickets
  //      SET status = 'cancelled',
  //          updated_at = NOW()
  //      WHERE booking_id = $1`,
  //     [bookingId]
  //   );
  //       // 5) Send refund email (optional)
  //   try {
  //     const userEmail = obj.order.shipping_data.email;
  //     await sendRefundEmail(userEmail, {
  //       bookingId,
  //       refundId,
  //       transactionId,
  //       amount,
  //     });
  //      res.status(200).json({ success: true, message: "Refund processed", refundId });
  //   } catch (err) {
  //     console.error("Refund email failed:", err.message);
  //   }

  //   await client.query("COMMIT");
  //     // console.log(payload)
  //     // return  res.status(200).json({message: payload});
  //   }
        
    if (obj.is_standalone_payment)
    {await client.query("BEGIN");
    // Update payment with idempotence check
    const amountCents = Number(obj.amount_cents);
    if (isNaN(amountCents)) {
      throw new Error("Invalid amount in webhook payload");
    }

    const amount = Math.floor(amountCents / 100);
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
      [newStatus, transactionId, paymentMethod, amount ,paymentId]
    );

    if (paymentUpdate.rowCount === 0) {
      await client.query("ROLLBACK");
      return res
        .status(409)
        .json({ error: "Payment already processed or not found" });
    }

    const bookingId = paymentUpdate.rows[0].booking_id;

    if (success) {
      // Only update booking if payment succeeded
      await client.query(
        `UPDATE booking
         SET status = $1,
             priority = $2,
             updated_at = NOW()
         WHERE booking_id = $3`,
        ["confirmed", 1, bookingId]
      );

      // Create and send ticket email
      try {
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

        const { rows: userTicket } = await pool.query(getTicketQ, [
          bookingId,
        ]);

        const ticket = userTicket[0]

        const userEmail = obj.order.shipping_data.email;
        await sendTicketEmail(userEmail,ticket);
        await client.query(
          "UPDATE tickets SET email_status = 'sent', email_sent_at = NOW(), updated_at = NOW(), status = 'issued' WHERE booking_id = $1",
          [bookingId]
        );
      } catch (err) {
        await client.query(
          "UPDATE tickets SET email_status = 'failed' WHERE booking_id = $1",
          [bookingId]
        );
      }
    }

    await client.query("COMMIT");
    return res.status(200).json({ ok: true});

  }
    return res.status(400).json({ ok: false});
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Webhook error:", err);

    if (err.code === "22P02") {
      return res.status(400).json({ error: "Invalid UUID format" });
    }

    return res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
};


const webhookRefund = async (req,res) => {

  console.log("POST /refund/webhook called");
  const client = await pool.connect();
  try {
    const payload = req.body;
    const obj = payload.obj || {};
    const paymentId = obj.order?.merchant_order_id;
    const transactionId = obj.id;
    const success = obj.success === true || obj.success === "true";

    // Validate
    if (!paymentId || !transactionId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!hmacVerifier(payload, req.query.hmac)) {
      return res.status(400).json({ error: "Invalid HMAC signature" });
    }

    // Determine status
    const newStatus = success ? "paid" : "failed";
    const paymentMethod = `${obj.source_data?.type || "N/A"} | ${
      obj.source_data?.sub_type || "N/A"
    }`;
    console.log(obj.is_refunded)
    if(obj.is_refunded){
       await client.query("BEGIN");

    // Update payment with idempotence check
    const paymentUpdate = await client.query(
      `UPDATE payment
       SET payment_status = 'refunded',
           updated_at = NOW()
       WHERE payment_id = $1
         AND payment_status = 'paid'
       RETURNING booking_id`,
      [paymentId]
    );

    if (paymentUpdate.rowCount === 0) {
      await client.query("ROLLBACK");
      return res
        .status(409)
        .json({ error: "Payment already refunded or not found" });
    }

    const bookingId = paymentUpdate.rows[0].booking_id;
    const userId = paymentUpdate.rows[0].user_id;
    // console.log(obj.amount)
    const amountCents = Number(obj.amount_cents);
    if (isNaN(amountCents)) {
      throw new Error("Invalid amount in webhook payload");
    }

    const amount = Math.floor(amountCents / 100);
    // 2) Insert refund record (new transaction)
    const refundInsert = await client.query(
      `INSERT INTO refund (payment_id, refund_transaction_id,reason, amount,status, created_at)
       VALUES ($1, $2, $3, $4,'refunded', NOW())
       RETURNING refund_id`,
      [paymentId, transactionId, "bec I am" , amount]
    );

    const refundId = refundInsert.rows[0].refund_id;

    // 3) Update booking
    await client.query(
      `UPDATE booking
       SET status = 'cancelled',
           priority = NULL,
           updated_at = NOW()
       WHERE booking_id = $1`,
      [bookingId]
    );
   // 4) Update tickets
    await client.query(
      `UPDATE tickets
       SET status = 'cancelled',
           updated_at = NOW()
       WHERE booking_id = $1`,
      [bookingId]
    );
        // 5) Send refund email (optional)
    try {
      const userEmail = obj.order.shipping_data.email;
      await sendRefundEmail(userEmail, {
        bookingId,
        refundId,
        transactionId,
        amount,
      });
       res.status(200).json({ success: true, message: "Refund processed", refundId });
    } catch (err) {
      console.error("Refund email failed:", err.message);
    }

    await client.query("COMMIT");
      // console.log(payload)
      // return  res.status(200).json({message: payload});
    return res.status(200).json({ ok: true});
    }
    return res.status(400).json({ ok: false});

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Webhook error:", err);

    if (err.code === "22P02") {
      return res.status(400).json({ error: "Invalid UUID format" });
    }

    return res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
};


const webhookAuth = async (req, res) => {
  console.log("POST /payment/webhook called");

  const client = await pool.connect();
  try {
    const payload = req.body;
    const obj = payload.obj || {};
    const paymentId = obj.order?.merchant_order_id;
    const transactionId = obj.id;
    const success = obj.success === true || obj.success === "true";

    // Validate
    if (!paymentId || !transactionId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!hmacVerifier(payload, req.query.hmac)) {
      return res.status(400).json({ error: "Invalid HMAC signature" });
    }

    // Determine status
    const newStatus = success ? "paid" : "failed";
    const paymentMethod = `${obj.source_data?.type || "N/A"} | ${
      obj.source_data?.sub_type || "N/A"
    }`;
    console.log(obj.is_refunded)
  //   if(obj.is_refunded){
  //      await client.query("BEGIN");

  //   // Update payment with idempotence check
  //   const paymentUpdate = await client.query(
  //     `UPDATE payment
  //      SET payment_status = 'refunded',
  //          updated_at = NOW()
  //      WHERE payment_id = $1
  //        AND payment_status = 'paid'
  //      RETURNING booking_id`,
  //     [paymentId]
  //   );

  //   if (paymentUpdate.rowCount === 0) {
  //     await client.query("ROLLBACK");
  //     return res
  //       .status(409)
  //       .json({ error: "Payment already refunded or not found" });
  //   }

  //   const bookingId = paymentUpdate.rows[0].booking_id;
  //   const userId = paymentUpdate.rows[0].user_id;
  //   // console.log(obj.amount)
  //   const amountCents = Number(obj.amount_cents);
  //   if (isNaN(amountCents)) {
  //     throw new Error("Invalid amount in webhook payload");
  //   }

  //   const amount = Math.floor(amountCents / 100);
  //   // 2) Insert refund record (new transaction)
  //   const refundInsert = await client.query(
  //     `INSERT INTO refund (payment_id, refund_transaction_id,reason, amount,status, created_at)
  //      VALUES ($1, $2, $3, $4,'refunded', NOW())
  //      RETURNING refund_id`,
  //     [paymentId, transactionId, "bec I am" , amount]
  //   );

  //   const refundId = refundInsert.rows[0].refund_id;

  //   // 3) Update booking
  //   await client.query(
  //     `UPDATE booking
  //      SET status = 'cancelled',
  //          priority = NULL,
  //          updated_at = NOW()
  //      WHERE booking_id = $1`,
  //     [bookingId]
  //   );
  //  // 4) Update tickets
  //   await client.query(
  //     `UPDATE tickets
  //      SET status = 'cancelled',
  //          updated_at = NOW()
  //      WHERE booking_id = $1`,
  //     [bookingId]
  //   );
  //       // 5) Send refund email (optional)
  //   try {
  //     const userEmail = obj.order.shipping_data.email;
  //     await sendRefundEmail(userEmail, {
  //       bookingId,
  //       refundId,
  //       transactionId,
  //       amount,
  //     });
  //      res.status(200).json({ success: true, message: "Refund processed", refundId });
  //   } catch (err) {
  //     console.error("Refund email failed:", err.message);
  //   }

  //   await client.query("COMMIT");
  //     // console.log(payload)
  //     // return  res.status(200).json({message: payload});
  //   }
        
    if (obj.is_standalone_payment)
    {await client.query("BEGIN");
    // Update payment with idempotence check
    const amountCents = Number(obj.amount_cents);
    if (isNaN(amountCents)) {
      throw new Error("Invalid amount in webhook payload");
    }

    const amount = Math.floor(amountCents / 100);
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
      [newStatus, transactionId, paymentMethod, amount ,paymentId]
    );

    if (paymentUpdate.rowCount === 0) {
      await client.query("ROLLBACK");
      return res
        .status(409)
        .json({ error: "Payment already processed or not found" });
    }

    const bookingId = paymentUpdate.rows[0].booking_id;

    if (success) {
      // Only update booking if payment succeeded
      await client.query(
        `UPDATE booking
         SET status = $1,
             priority = $2,
             updated_at = NOW()
         WHERE booking_id = $3`,
        ["confirmed", 1, bookingId]
      );

      // Create and send ticket email
      try {
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

        const { rows: userTicket } = await pool.query(getTicketQ, [
          bookingId,
        ]);

        const ticket = userTicket[0]

        const userEmail = obj.order.shipping_data.email;
        await sendTicketEmail(userEmail,ticket);
        await client.query(
          "UPDATE tickets SET email_status = 'sent', email_sent_at = NOW(), updated_at = NOW(), status = 'issued' WHERE booking_id = $1",
          [bookingId]
        );
      } catch (err) {
        await client.query(
          "UPDATE tickets SET email_status = 'failed' WHERE booking_id = $1",
          [bookingId]
        );
      }
    }

    await client.query("COMMIT");
    return res.status(200).json({ ok: true});

  }
    return res.status(400).json({ ok: false});
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Webhook error:", err);

    if (err.code === "22P02") {
      return res.status(400).json({ error: "Invalid UUID format" });
    }

    return res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
};

const webhookCap = async (req,res) => {
}


const webhookVoid = async (req,res) => {

  console.log("POST /refund/webhook called");
  const client = await pool.connect();
  try {
    const payload = req.body;
    const obj = payload.obj || {};
    const paymentId = obj.order?.merchant_order_id;
    const transactionId = obj.id;
    const success = obj.success === true || obj.success === "true";

    // Validate
    if (!paymentId || !transactionId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!hmacVerifier(payload, req.query.hmac)) {
      return res.status(400).json({ error: "Invalid HMAC signature" });
    }

    // Determine status
    const newStatus = success ? "paid" : "failed";
    const paymentMethod = `${obj.source_data?.type || "N/A"} | ${
      obj.source_data?.sub_type || "N/A"
    }`;
    console.log(obj.is_refunded)
    if(obj.is_refunded){
       await client.query("BEGIN");

    // Update payment with idempotence check
    const paymentUpdate = await client.query(
      `UPDATE payment
       SET payment_status = 'refunded',
           updated_at = NOW()
       WHERE payment_id = $1
         AND payment_status = 'paid'
       RETURNING booking_id`,
      [paymentId]
    );

    if (paymentUpdate.rowCount === 0) {
      await client.query("ROLLBACK");
      return res
        .status(409)
        .json({ error: "Payment already refunded or not found" });
    }

    const bookingId = paymentUpdate.rows[0].booking_id;
    const userId = paymentUpdate.rows[0].user_id;
    // console.log(obj.amount)
    const amountCents = Number(obj.amount_cents);
    if (isNaN(amountCents)) {
      throw new Error("Invalid amount in webhook payload");
    }

    const amount = Math.floor(amountCents / 100);
    // 2) Insert refund record (new transaction)
    const refundInsert = await client.query(
      `INSERT INTO refund (payment_id, refund_transaction_id,reason, amount,status, created_at)
       VALUES ($1, $2, $3, $4,'refunded', NOW())
       RETURNING refund_id`,
      [paymentId, transactionId, "bec I am" , amount]
    );

    const refundId = refundInsert.rows[0].refund_id;

    // 3) Update booking
    await client.query(
      `UPDATE booking
       SET status = 'cancelled',
           priority = NULL,
           updated_at = NOW()
       WHERE booking_id = $1`,
      [bookingId]
    );
   // 4) Update tickets
    await client.query(
      `UPDATE tickets
       SET status = 'cancelled',
           updated_at = NOW()
       WHERE booking_id = $1`,
      [bookingId]
    );
        // 5) Send refund email (optional)
    try {
      const userEmail = obj.order.shipping_data.email;
      await sendRefundEmail(userEmail, {
        bookingId,
        refundId,
        transactionId,
        amount,
      });
       res.status(200).json({ success: true, message: "Refund processed", refundId });
    } catch (err) {
      console.error("Refund email failed:", err.message);
    }

    await client.query("COMMIT");
      // console.log(payload)
      // return  res.status(200).json({message: payload});
    return res.status(200).json({ ok: true});
    }
    return res.status(400).json({ ok: false});

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Webhook error:", err);

    if (err.code === "22P02") {
      return res.status(400).json({ error: "Invalid UUID format" });
    }

    return res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
};

export{ 
    webhookStandalone,webhookRefund,webhookAuth,webhookCap,webhookVoid};