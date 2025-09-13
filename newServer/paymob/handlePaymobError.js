import { reconcilePaymob } from "../cron jobs/reconcilePaymob.js";
import pool from "../db.js";

// 🔹 Helper 3: Error reconciliation
export async function handlePaymobError(error) {
  console.log(error)
  const msg = error?.response?.data?.merchant_order_id;
  const match = msg?.match(/ref:\s*([a-f0-9-]+)/i);

  if (!match) {
    throw new Error("Unexpected Paymob error format");
  }

  const existingOrderId = match[1];
  console.log("Existing merchant_order_id:", existingOrderId);

  try {
    const result = await reconcilePaymob(existingOrderId);
    if (result === 404) {
      await pool.query(
        "UPDATE payment SET payment_status = $1 WHERE payment_id = $2",
        ["failed", existingOrderId]
      );
      throw new Error("This payment expired, please try again.");
    }
    return result
  } catch (err) {
    console.error(err);
    await pool.query(
      "UPDATE payment SET payment_status = $1 WHERE payment_id = $2",
      ["failed", existingOrderId]
    );
    throw new Error("This payment expired, please try again.");
  }
}