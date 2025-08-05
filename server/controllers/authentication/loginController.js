const bcrypt = require("bcrypt");
const userModel = require("../../models/user");
const session = require("../../utils/session");

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
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json("This email does not exist");
    }

    // Check password validity
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json("The password is incorrect");
    }

    // Regenerate session to prevent session fixation
    session.regenerate(req, res, user);
    
  } catch (err) {
    console.error(err);
    res.status(500).json("Internal server error");
  }
};


module.exports = {login}