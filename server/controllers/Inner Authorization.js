/**
 * @file Inner Authorization.js
 * @description Provides internal authorization checks for admin access control
 * @module InnerAuthorization
 */

const express = require("express");

/**
 * @function isAuthorized
 * @description Checks if a user has admin privileges
 * @param {Object} user - User object from database
 * @param {string} user.role - User's role (e.g., 'admin', 'user')
 * @returns {boolean} True if user has admin role, false otherwise
 * @example
 * const user = { role: 'admin' };
 * const hasAccess = isAuthorized(user); // returns true
 */
const isAuthorized = (user) => {
  return user && user.role === "admin"; 
};

module.exports = { isAuthorized };
