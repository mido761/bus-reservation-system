const express = require("express");

const isAuthorized = (user) => {
  return user && user.role === "admin"; // Assuming 'role' field exists in the User schema
};

module.exports = { isAuthorized };
