import bcrypt from "bcrypt";
import { regenerate } from "../../utils/session.js";
import pool from "../../db.js";
/**
 * @route POST /api/login
 * @description Authenticate user and create session
 * @access Public
 * @param {Object} req.body
 * @param {string} req.body.email - User email
 * @param {string} req.body.password - User password
 * @returns {string} Authentication status message
 * @throws {401} If credentials are invalid
 * @throws {404} If user not found
 * @throws {500} For server errors
 */

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const emailLower = email.toLowerCase();
    const SearchForMailQuery = `SELECT * FROM users WHERE email = $1 LIMIT 1`;
    const { rows } = await pool.query(SearchForMailQuery, [emailLower]);
    const user = rows[0];

    if (!user) {
      return res.status(404).json("This email does not exist");
    }

    // Check password validity
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json("The password is incorrect");
    }

    console.log(user)
    // Regenerate session to prevent session fixation
    regenerate(req, res, user);
  } catch (err) {
    console.error(err);
    res.status(500).json("Internal server error");
  }
};

export { login };
