import pool from "../../db.js";

// 🔹 Helper 1: Find or create payment
export async function findOrCreatePayment(bookingId) {
  const searchQ = `
    SELECT * FROM payment
    WHERE booking_id = $1
    ORDER BY created_at DESC
    LIMIT 1
  `;
  const { rows } = await pool.query(searchQ, [bookingId]);
  let payment = rows[0];

  if (!payment || ["failed", "expired"].includes(payment.payment_status)) {
    const insertQ = `
      INSERT INTO payment (booking_id, payment_status, payment_method)
      VALUES ($1, 'pending', 'standAlone')
      RETURNING *
    `;
    const { rows: inserted } = await pool.query(insertQ, [bookingId]);
    payment = inserted[0];
  }

  return payment;
}