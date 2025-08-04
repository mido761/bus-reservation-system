const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

/**
 * Authentication middleware to verify if a user is logged in
 * @middleware
 * @description Checks if a user is authenticated through session
 * @param {Object} req - Express request object
 * @param {Object} req.session - Session object
 * @param {string} req.session.userId - User ID from session
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 * @throws {401} If user is not authenticated
 */
const isAuthenticated = (req, res, next) => {
  if (process.env.NODE_ENV === "development") return next();
  
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: "unauthenticated: Please log in" });
};

/**
 * Authorization middleware to verify if a user has admin privileges
 * @middleware
 * @description Checks if a user has admin role
 * @param {Object} req - Express request object
 * @param {Object} req.session - Session object
 * @param {string} req.session.userId - User ID from session
 * @param {string} req.session.userRole - User role from session
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 * @throws {401} If user is not authorized as admin
 */
const isAuthoraized = (req, res, next) => {
  if (process.env.NODE_ENV === "development") return next();
 
  if (req.session && req.session.userId && req.session.userRole === "admin") {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized, Access denied" });
};

module.exports = { isAuthenticated, isAuthoraized };
