const express = require("express");
// import any required modules like login, logout or register
const loginController = require("../controllers/authentication/loginController")
const logoutController = require("../controllers/authentication/logoutController")
const registerController = require("../controllers/authentication/registrationController")
const middleware = require("../controllers/middleware");

const router = express.Router() // used for controllers reference


// use controllers with router method
router.post("/login", loginController.login);
router.post("/logout", middleware.isAuthenticated, logoutController.logout);
// router.post("/register", registerController);

// export the file as a module that could be imported somewhere else
module.exports = router;