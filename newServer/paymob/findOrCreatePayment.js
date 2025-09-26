import pool from "../db.js";

// 🔹 Helper 1: Find or create payment
export async function findOrCreatePayment(bookingId, price, trx, senderNumber) {
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
      INSERT INTO payment (booking_id, payment_status, payment_method, amount, sender_number, transaction_id)
      VALUES ($1, $2, $3, $4, $5, $6 )
      RETURNING *
    `;
    const { rows: inserted } = await pool.query(insertQ, [bookingId, 'pending', 'VFcash', price, senderNumber, trx]);
    payment = inserted[0];
  }

  return payment;
}
