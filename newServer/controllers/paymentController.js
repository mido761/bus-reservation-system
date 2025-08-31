import session from "express-session";
import axios from "axios";
import pool from "../db.js";
import hmacVerifier from "../utils/hmacVerifier.js";
import {reconcilePaymob} from "../cron jobs/reconcilePaymob.js";

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

    return res.status(200).json({user_payments: payments});
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addPayment = async (req, res) => {
  const { bookingId, transactionId, amount, paymentType } = req.body;
};

const standAlonePayment = async (req, res) => {
  const { booking, trip, route } = req.body;

  try {
    // 🔹 Step 1: Check if payment already exists
    const searchPaymentQ = `SELECT * FROM payment WHERE booking_id = $1 LIMIT 1`;
    const { rows } = await pool.query(searchPaymentQ, [booking.booking_id]);
    let payment = rows[0];

    // 🔹 Step 2: Get user info
    const userId = req.session.userId;
    const getUser = `SELECT username, email, phone_number FROM users WHERE user_id = $1`;
    const { rows: userRows } = await pool.query(getUser, [userId]);
    const user = userRows[0];

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // 🔹 Step 3: If no payment, create one
    if (!payment) {
      const addPaymentQ = `
        INSERT INTO payment (booking_id, payment_status, payment_method)
        VALUES ($1, 'pending', 'standAlone')
        RETURNING *`;
      const { rows: inserted } = await pool.query(addPaymentQ, [booking.booking_id]);
      payment = inserted[0];
    }

    // 🔹 Step 4: Handle payment status
    if (payment.payment_status === "paid") {
      return res.status(400).json({ message: "This payment is already completed." });
    }

    if (["failed", "expired"].includes(payment.payment_status)) {
      return res.status(400).json({ message: "This payment session is no longer valid." });
    }

    // 🔹 Step 5: Build Paymob request body (DRY)
    const body = {
      amount: trip.price,
      currency: "EGP",
      payment_methods: [Number(process.env.INTEGRATION_ID)],

      items: [
        {
          name: "trip",
          amount: trip.price,
          description: `a trip from ${route.source} to ${route.destination} and pickup point is ${booking.stop_name}`,
          quantity: 1,
        },
      ],

      billing_data: {
        first_name: user.username,
        last_name: "ahmed", // maybe store actual last name later
        phone_number: user.phone_number,
        city: "dummy",
        country: "dummy",
        email: user.email,
        floor: "dummy",
        state: "dummy",
      },

      extras: { ee: 22 },

      special_reference: `${payment.payment_id}`, // ✅ Always unique per DB row

      notification_url: `${process.env.BASE_URL}/payment/webhook`,
      redirection_url: "http://localhost:5173/#/ticket-summary",
    };

    // 🔹 Step 6: Call Paymob
    const response = await axios.post(
      "https://accept.paymob.com/v1/intention/",
      body,
      {
        headers: { Authorization: `Token ${process.env.SECRET_KEY}` },
      }
    );

    const PAYMENT_URL = `https://accept.paymob.com/api/acceptance/iframes/${process.env.IFRAME_ID}?payment_token=${response.data.payment_keys[0].key}`;
    
    return res.status(200).json({ PAYMENT_URL });

  } catch (error) {
     if (error.response) {
        const msg = error.response.data.merchant_order_id;
        // console.log("Error msg:", msg);

        // if you want just the order_id (UUID) inside the string:
        const match = msg.match(/ref:\s*([a-f0-9-]+)/i);
        if (match) {
          const existingOrderId = match[1];
          console.log("Existing merchant_order_id:", existingOrderId);
          const inPaymob =await reconcilePaymob(existingOrderId)
          if(inPaymob === 404){
            await pool.query(
            "UPDATE payment SET payment_status = $1 WHERE payment_id = $2",
            ['failed', existingOrderId]
            ); 
            return res.status(400).json({ message: `This payment expiard please try again you have now tries (3-)`})
          }
        }
        // console.log(match[1])

        
        // console.log(inPaymob)
      } else {
        console.error("Unexpected error:", error);
      
    
    console.error(error.response?.data || error.message);
    return res.status(500).json({ message: error.message });
  }
  }
};


const webhookUpdate = async (req, res) => {
  console.log("POST /payment/webhook called");

  const payload = req.body;
  const obj = payload.obj || {};

  const transactionId = obj.id;
  const paymentId = obj.order?.merchant_order_id;
  const error_occured = obj.error_occured;
  const pending = obj.pending;
  const source_data_sub_type = obj.source_data?.sub_type;
  const source_data_type = obj.source_data?.type;
  const success = obj.success;

  const payment_method = `${source_data_type || "N/A"} | ${
    source_data_sub_type || "N/A"
  }`;

  const receivedHmac = req.query.hmac;

  const client = await pool.connect();

  try {
    // console.log("Body:", payload);

    // 🔹 Validate basic input early
    if (!paymentId) {
      return res.status(400).json({ error: "Missing merchant_order_id" });
    }

    // if (error_occured) {
    //   return res.status(422).json({ error: "Error occurred during payment" });
    // }

    const validHMAC = hmacVerifier(payload, receivedHmac);
    if (!validHMAC) {
      return res.status(400).json({ error: "Invalid HMAC signature" });
    }
    console.log(payload)

    if (!success) {
      const updatePayment = `
      UPDATE payment
      SET payment_status = 'failed',
          transaction_id = $2,
          payment_method = $3,
          updated_at = NOW()
      WHERE payment_id = $1 
      AND payment_status = 'pending'
      RETURNING booking_id
    `;

      const result = await client.query(updatePayment, [
        paymentId,
        transactionId,
        payment_method,
      ]);

      if (result.rowCount === 0) {
        return res
          .status(409)
          .json({ error: "Payment already processed or not found" });
      }

      return res.status(422).json({
        error: "Payment not successful",
        message: obj?.data?.message || "Unknown failure",
      });
    }

    await client.query("BEGIN");

    // 🔹 Update payment record
    const updatePayment = `
      UPDATE payment
      SET payment_status = 'paid',
          transaction_id = $2,
          payment_method = $3,
          updated_at = NOW()
      WHERE payment_id = $1 
      AND payment_status = 'pending'
      RETURNING booking_id
    `;

    const result = await client.query(updatePayment, [
      paymentId,
      transactionId,
      payment_method,
    ]);

    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      return res
        .status(409)
        .json({ error: "Payment already processed or not found" });
    }

    const bookingId = result.rows[0].booking_id;

    // 🔹 Update booking
    const bookingUpdateResult = await client.query(
      `UPDATE booking
       SET status = $2,
           priority = $3,
           updated_at = NOW()
       WHERE booking_id = $1`,
      [bookingId, "confirmed", 1]
    );

    if (bookingUpdateResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res
        .status(409)
        .json({ error: "Booking update failed or already processed" });
    }

    await client.query("COMMIT");
    return res.status(200).json({ ok: true });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Payment webhook error:", err);

    // If it's a UUID casting error or bad input
    if (err.code === "22P02") {
      // Postgres invalid_text_representation
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
