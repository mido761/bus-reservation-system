const session = require("../../../server/utils/session")

/**
 * @route POST /logout
 * @description End user session and clear cookies
 * @access Protected
 * @middleware isAuthenticated
 * @returns {string} Logout status message
 * @throws {500} If session destruction fails
 */
const logout = async (req, res) => {
  session.destroy(req, res)
};


module.exports = {logout}