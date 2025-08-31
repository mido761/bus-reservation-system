import pool from "../../db.js";

// 🔹 Helper 1: Find or create payment
export async function limitPaymentRetries(bookingId) {
  const searchQ = `
    SELECT COUNT(*) 
    FROM payment
    WHERE booking_id = $1
    AND payment_status = 'failed'
  `;
  const { rows } = await pool.query(searchQ, [bookingId]);
  const count = rows[0].count;

  let result = []
  if (count > 2){
    try{
        const updateBooking = `
        UPDATE booking
        SET status = 'expired', 
        updated_at = NOW()
        WHERE booking_id = $1
        RETURNING booking_id, status
        `
        const {rows: bookings} = await pool.query(updateBooking, [bookingId])
        result = bookings

    }catch(err){
        throw new Error(`Error Invalidating booking: ${err}`)
    }
  }

  return result;
}
