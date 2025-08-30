import pool from "../db.js";
import { fetchPaymobAuthToken } from "../utils/fetchPaymobAuthToken.js";
import axios from "axios";

export async function reconcilePaymob() {
  const client = await pool.connect();
  let tx = {};

  const pending = await client.query(
    "SELECT * FROM payment WHERE payment_status = 'pending'"
  );

  // console.log(pending.rows);
  for (const p of pending.rows) {
    // app.post("/api/transaction_inquiry", async (req, res) => {

    try {
      const token = await fetchPaymobAuthToken();

      // console.log("Token: ", token);

      const inquiryResponse = await axios.post(
        "https://accept.paymob.com/api/ecommerce/orders/transaction_inquiry",
        { merchant_order_id: p.payment_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      tx = inquiryResponse.data;
      console.log(inquiryResponse.data.success);
    } catch (err) {
      console.error(err.message);
      if (err.status === 404) continue;

      throw new Error("Error fetching transaction details from paymob!");
    }
    // });

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
      console.log(`Reconciled booking ${p.booking_id} → ${newBookingStatus}`);

      return `Reconciled booking ${p.booking_id} → ${newBookingStatus}`;
    } catch (err) {
      await client.query("ROLLBACK");
      throw new Error(err);
    }
  }

  return "No payments to update!"
}

export default { reconcilePaymob };
