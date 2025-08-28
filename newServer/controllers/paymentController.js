import session from "express-session";
import axios from "axios";
import pool from "../db.js";
import hmacVerifier from "../utils/hmacVerifier.js";

const getPayment = async (req, res) => {
  try {
    const getRoutes = `
    SELECT * FROM payment;
    `;

    const { rows } = await pool.query(getRoutes);
    const routes = rows;

    return res.status(200).json(routes);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addPayment = async (req, res) => {
  const { bookingId, transactionId, amount, paymentType } = req.body;
};

const standAlonePayment = async (req, res) => {
  const { booking, payment, trip, route, stop } = req.body;
  console.log(trip);
  try {
    const userId = req.session.userId;
    const getUser = `SELECT username, email, phone_number FROM users WHERE user_id = $1`;
    const { rows } = await pool.query(getUser, [userId]);
    const user = rows[0];
    console.log([process.env.INTEGRATION_ID]);
    // from session
    const First_Name = "mohamed";
    const Last_Name = "ahmed";
    // const Customer_Phone_Number = 12343423;
    // const customer_email = "modystar9999@gmail.com";
    ////// creating body
    const body = {
      amount: trip.price, // amount_cents must be equal to the sum of the items amounts
      currency: "EGP",
      payment_methods: [Number(process.env.INTEGRATION_ID)], //Enter your integration ID as an Integar, you can list multiple integration IDs as -> "payment_methods": [{{Integration_ID_1}}, {{Integration_ID_2}}, {{Integration_ID_3}}], so the user can choose the payment method within the checkout page

      items: [
        {
          name: "trip",
          amount: trip.price,
          description: `a trip from ${route.source} to ${route.destination} and pickup point is ${stop.stop_name}`,
          quantity: 1,
        },
      ],
      billing_data: {
        first_name: First_Name, // First Name, Last Name, Phone number, & Email are mandatory fields within sending the intention request
        last_name: Last_Name,
        phone_number: user.phone_number,
        city: "dumy",
        country: "dumy",
        email: user.email,
        floor: "dumy",
        state: "dumy",
      },

      extras: {
        ee: 22,
      },
      special_reference: `${payment.payment_id}`,

      notification_url: `${process.env.BASE_URL}/payment/webhook`,
      redirection_url: "http://localhost:5000/#/ticket-summary",
      //Notification and redirection URL are working only with Cards and they overlap the transaction processed and response callbacks sent per Integration ID
    };

    ///// the paymob api call
    const response = await axios.post(
      "https://accept.paymob.com/v1/intention/",
      body,
      {
        headers: {
          Authorization: `Token ${process.env.SECRET_KEY}`,
        },
      }
    );
    const PAYMENT_URL = `https://accept.paymob.com/api/acceptance/iframes/${process.env.IFRAME_ID}?payment_token=${response.data.payment_keys[0].key}`;

    return res.status(200).json({ PAYMENT_URL });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
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

  const receivedHmac = req.query.hmac;

  const client = await pool.connect();

  try {
    // console.log("Body:", payload);

    // 🔹 Validate basic input early
    if (!paymentId) {
      return res.status(400).json({ error: "Missing merchant_order_id" });
    }

    if (error_occured) {
      return res.status(422).json({ error: "Error occurred during payment" });
    }

    const validHMAC = hmacVerifier(payload, receivedHmac);
    if (!validHMAC) {
      return res.status(400).json({ error: "Invalid HMAC signature" });
    }

    if (!success) {
      return res.status(422).json({
        error: "Payment not successful",
        message: obj?.data?.message || "Unknown failure"
      });
    }

    const payment_method = `${source_data_type || "N/A"} | ${source_data_sub_type || "N/A"}`;

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
      return res.status(409).json({ error: "Payment already processed or not found" });
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
      return res.status(409).json({ error: "Booking update failed or already processed" });
    }

    await client.query("COMMIT");
    return res.status(200).json({ ok: true });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Payment webhook error:", err);

    // If it's a UUID casting error or bad input
    if (err.code === "22P02") { // Postgres invalid_text_representation
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
  getPayment,
  webhookUpdate,
  addPayment,
  editPayment,
  deletPayment,
  standAlonePayment,
};
