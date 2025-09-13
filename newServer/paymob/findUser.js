import pool from "../db.js";

export const findUser = async (userId) => {
  const { rows: userRows } = await pool.query(
    "SELECT username, email, phone_number FROM users WHERE user_id = $1",
    [userId]
  );
  return userRows[0];
};
