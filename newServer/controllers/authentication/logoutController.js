import { destroy } from "../../utils/session.js";

/**
 * @route POST /logout
 * @description End user session and clear cookies
 * @access Protected
 * @middleware isAuthenticated
 * @returns {string} Logout status message
 * @throws {500} If session destruction fails
 */
const logout = async (req, res) => {
  destroy(req, res);
};


export { logout };