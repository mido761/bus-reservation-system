import axios from "axios";
import pool from "../db.js";
import hmacVerifier from "../utils/hmacVerifier.js";
import { buildPaymobBody } from "../helperfunctions/paymob/buildPaymobBody.js";
import { findOrCreatePayment } from "../helperfunctions/paymob/findOrCreatePayment.js";
import { handlePaymobError } from "../helperfunctions/paymob/handlePaymobError.js";
import { limitPaymentRetries } from "../helperfunctions/paymob/countPaymentRetries.js";
import { sendMail } from "../utils/nodeMailer.js";

const getUserPayments = async (req, res) => {
  try {
    const getUserPayments = `
    SELECT 
      payment.payment_id,
      payment.amount,
      payment.payment_method,
      payment.payment_status,
      payment.created_at,
      payment.updated_at
    FROM payment
    JOIN booking 
      ON payment.booking_id = booking.booking_id
    WHERE booking.passenger_id = $1
    ORDER BY payment.created_at DESC, payment.updated_at DESC
    `;

    const { rows } = await pool.query(getUserPayments, [req.session.userId]);
    const payments = rows;

    return res.status(200).json({ user_payments: payments });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addPayment = async (req, res) => {
  const { bookingId, transactionId, amount, paymentType } = req.body;
};

// 🔹 Main function
const standAlonePayment = async (req, res) => {
  const { booking, trip, route } = req.body;

  try {
    // limit retries
    const limit = await limitPaymentRetries(booking.booking_id);
    if (limit.length > 0) {
      return res.status(429).json({
        message: `Maximum payment attempts reached (3). Please contact support.`,
      });
    }

    // Step 1: Get user
    const userId = req.session.userId;
    const { rows: userRows } = await pool.query(
      "SELECT username, email, phone_number FROM users WHERE user_id = $1",
      [userId]
    );
    const user = userRows[0];
    if (!user) return res.status(404).json({ message: "User not found." });

    // Step 2: Get or create payment
    const payment = await findOrCreatePayment(booking.booking_id);

    if (payment.payment_status === "paid") {
      return res.status(400).json({ message: "Payment already completed." });
    }
    if (["failed", "expired"].includes(payment.payment_status)) {
      return res
        .status(400)
        .json({ message: "This payment session is no longer valid." });
    }

    // Step 3: Build Paymob body & call API
    const body = buildPaymobBody(payment, user, booking, trip, route);
    const response = await axios.post(
      "https://accept.paymob.com/v1/intention/",
      body,
      { headers: { Authorization: `Token ${process.env.SECRET_KEY}` } }
    );

    // Step 4: Send URL back
    const PAYMENT_URL = `https://accept.paymob.com/api/acceptance/iframes/${process.env.IFRAME_ID}?payment_token=${response.data.payment_keys[0].key}`;
    return res.status(200).json({ PAYMENT_URL });
  } catch (error) {
    try {
      await handlePaymobError(error);
      return res.status(400).json({message: "Payment already succeeded."});
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  }
};

const webhookUpdate = async (req, res) => {
  const client = await pool.connect();
  try {
    const payload = req.body;
    const obj = payload.obj || {};
    const paymentId = obj.order?.merchant_order_id;
    const transactionId = obj.id;
    const success = obj.success;

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

    await client.query("BEGIN");

    // Update payment with idempotence check
    const paymentUpdate = await client.query(
      `UPDATE payment
       SET payment_status = $1,
           transaction_id = $2,
           payment_method = $3,
           updated_at = NOW()
       WHERE payment_id = $4
         AND payment_status = 'pending'
       RETURNING booking_id`,
      [newStatus, transactionId, paymentMethod, paymentId]
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
      const userEmail = obj.order.shipping_data.email
      const emailSubject = `Trip Ticket Confirmation`
      const emailBody = obj?.order?.items[0]
      await sendMail(userEmail, emailSubject, emailBody);
    }

    await client.query("COMMIT");
    return res.status(200).json({ ok: true });
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

const editPayment = async (req, res) => {};

const deletPayment = async (req, res) => {};

export {
  getUserPayments,
  webhookUpdate,
  addPayment,
  editPayment,
  deletPayment,
  standAlonePayment,
};
