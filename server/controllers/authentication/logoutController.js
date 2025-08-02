/**
 * @route POST /logout
 * @description End user session and clear cookies
 * @access Protected
 * @middleware isAuthenticated
 * @returns {string} Logout status message
 * @throws {500} If session destruction fails
 */
module.exports.logout = async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json("failed to logout");
    }
    res.clearCookie("connect.sid");
    res.status(200).json("logout successfuly");
  });
};