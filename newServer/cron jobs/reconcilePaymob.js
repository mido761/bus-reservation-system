import pool from "../db.js";
// import { fetchPaymobAuthToken } from "../helperfunctions/paymob/fetchPaymobAuthToken.js";
import { PaymobClient } from "../helperfunctions/paymob/paymobClient.js";

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
      // Paymob CLient
      const paymob = new PaymobClient({
        publicKey: process.env.PUBLIC_KEY,
        secretKey: process.env.SECRET_KEY,
        apiKey: process.env.API_KEY,
      });

      const token = await paymob.fetchAuthToken();

      const inquiryResponse = await paymob.getTxn(
        token,
        "merchant_order_id",
        p.payment_id
      );

      console.log(inquiryResponse)
      tx = inquiryResponse;
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
