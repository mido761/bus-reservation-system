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

const webhookUpdate = async (req, res) => {
  const payload = req.body;
  const obj = payload.obj || {}; // Safely get 'obj', default to empty object if not present

  // Helper function to safely get string value, handling booleans and null/undefined
  const getSafeString = (value) => {
    if (typeof value === "boolean") {
      return value.toString();
    }
    // Convert to string; if null/undefined, default to empty string
    return String(value ?? "");
  };

  // --- Extract and prepare values from 'obj' for concatenation ---
  // Access properties from 'obj', not directly from 'payload'
  const transactionId = getSafeString(obj.id);
  const paymentId = getSafeString(obj.merchant_order_id);
  // const amount_cents = getSafeString(obj.amount_cents);
  // const created_at = getSafeString(obj.created_at);
  // const currency = getSafeString(obj.currency);
  const error_occured = getSafeString(obj.error_occured);
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
  const pending = getSafeString(obj.pending);
  // const source_data_pan = getSafeString(obj.source_data?.pan); // Safely access nested source_data
  const source_data_sub_type = getSafeString(obj.source_data?.sub_type);
  const source_data_type = getSafeString(obj.source_data?.type);
  const success = getSafeString(obj.success);

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
      console.log(paymentUpdate);
      const bookingId = result.rows[0].booking_id;
      // 2. Update booking
      const bookingUpdateResult = await client.query(
        `UPDATE bookings
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

export { getPayment, webhookUpdate, addPayment, editPayment, deletPayment };
