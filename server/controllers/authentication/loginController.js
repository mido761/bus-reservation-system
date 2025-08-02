const bcrypt = require("bcrypt");
const userModel = require("../../models/user");
const session = require("../../utils/session")

module.exports.login = async (req, res) => {
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
    session.regenerate(req, user);
    
    res.status(200).json("Login successful");
  } catch (err) {
    res.status(500).json("Internal server error");
  }
};
