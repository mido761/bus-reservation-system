const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

const isAuthenticated = (req, res, next) => {
  if (process.env.NODE_ENV === "development") return next();
  
  if (req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: "unauthenticated: Please log in" });
};

const isAuthoraized = (req, res, next) => {
  if (process.env.NODE_ENV === "development") return next();
 
  if (req.session.userId && req.session.userRole === "admin") {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized, Access denied" });
};

module.exports = { isAuthenticated, isAuthoraized };
