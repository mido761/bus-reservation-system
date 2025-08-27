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
  console.log(trip)
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
  console.log("POST /payment/webhook called")
  const payload = req.body;
  const obj = payload.obj || {}; // Safely get 'obj', default to empty object if not present

  // --- Extract and prepare values from 'obj' for concatenation ---
  // Access properties from 'obj', not directly from 'payload'
  const transactionId = payload.obj.id;
  const paymentId = payload.obj.order.merchant_order_id;
  console.log(paymentId)
  // const amount_cents = getSafeString(obj.amount_cents);
  // const created_at = getSafeString(obj.created_at);
  // const currency = getSafeString(obj.currency);
  const error_occured = payload.obj.error_occured;
  console.log(error_occured)
  // const has_parent_transaction = getSafeString(obj.has_parent_transaction);
  // const objId = getSafeString(obj.id); // 'id' from 'obj'
  // const integration_id = getSafeString(obj.integration_id);
  // const is_3d_secure = getSafeString(obj.is_3d_secure);
  // const is_auth = getSafeString(obj.is_auth);
  // const is_capture = getSafeString(obj.is_capture);
  // const is_refunded = getSafeString(obj.is_refunded);
  // const is_standalone_payment = getSafeString(obj.is_standalone_payment); // Verify this exact field name
  // const is_voided = getSafeString(obj.is_voided);
  // const orderId = getSafeString(obj.order?.id); // Safely access nested order.id
  // const owner = getSafeString(obj.owner);
  const pending = payload.obj.pending;
  // const source_data_pan = getSafeString(obj.source_data?.pan); // Safely access nested source_data
  const source_data_sub_type = payload.obj.source_data?.sub_type;
  const source_data_type = payload.obj.source_data?.type;
  const success = payload.obj.success;

  const receivedHmac = req.query.hmac;

  const client = await pool.connect();
  try {
    console.log("POST /webhook was called");
    console.log("Params: ", req.params);
    console.log("Body: ", req.body);

    if (error_occured) {
      throw new Error("Error Occured during payment!");
    }

    const validHMAC = hmacVerifier(payload, receivedHmac);

    if (!validHMAC) {
      throw new Error("Invalid HMAC signature!");
    }

    const payment_method = `${source_data_type} | ${source_data_sub_type}`;

    // Booking logic and payment logic goes here
    if (success) {
      await client.query("BEGIN");

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
        throw new Error("Payment update failed or already processed");
      }

      const bookingId = result.rows[0].booking_id;
      // 2. Update booking
      const bookingUpdateResult = await client.query(
        `UPDATE booking
       SET status = $2,
          priority = $3,
           updated_at = NOW()
       WHERE booking_id = $1`,
        [bookingId, success ? "confirmed" : "cancelled", 1]
      );

      if (bookingUpdateResult.rowCount === 0) {
        throw new Error("Booking update failed or already processed");
      }
    }

    await client.query("COMMIT");
    return res.status(200).send({ ok: true });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Payment webhook error:", err);
    return res.status(500).send({ error: err.message });
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
