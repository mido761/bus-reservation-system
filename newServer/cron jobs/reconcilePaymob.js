import pool from "../db.js";
import {fetchPaymobAuthToken} from "../helperfunctions/paymob/fetchPaymobAuthToken.js";
import axios from "axios";

export async function reconcilePaymob(payment_id = undefined) {
  const client = await pool.connect();
  let tx = {};
  let pending = [];

  if (!payment_id) {
    pending = await client.query(
      "SELECT * FROM payment WHERE payment_status = 'pending'"
    );
  } else {
    pending = await client.query(
      "SELECT * FROM payment WHERE payment_id = $1",
      [payment_id]
    );
  }

  const results = [];

  for (const p of pending.rows) {
    try {
      const token = await fetchPaymobAuthToken();

      const inquiryResponse = await axios.post(
        "https://accept.paymob.com/api/ecommerce/orders/transaction_inquiry",
        { merchant_order_id: p.payment_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      tx = inquiryResponse.data;
    } catch (err) {
      // if (err?.response?.status === 404) continue;
      throw new Error(err);
    }

    const newPaymentStatus = tx.success ? "paid" : "failed";
    const newBookingStatus = tx.success ? "confirmed" : "failed";
    const newPriority = tx.success ? 1 : 3;

    await client.query("BEGIN");
    try {
      await client.query(
        "UPDATE payment SET payment_status = $1, transaction_id = $2 WHERE payment_id = $3",
        [newPaymentStatus, tx.id, p.payment_id]
      );

      await client.query(
        "UPDATE booking SET status = $1, priority = $2 WHERE booking_id = $3",
        [newBookingStatus, newPriority, p.booking_id]
      );

      await client.query("COMMIT");
      results.push(`Reconciled booking ${p.booking_id} → ${newBookingStatus}`);
    } catch (err) {
      await client.query("ROLLBACK");
      throw new Error(err);
    }
  }

  return results.length > 0 ? results : "No payments to update!";
}
