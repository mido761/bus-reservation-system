const express = require("express");

const isAuthorized = (user) => {
  return user && user.role === "admin"; 
};

module.exports = { isAuthorized };
