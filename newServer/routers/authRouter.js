const express = require("express");
const router = express.Router() // used for controllers reference

// import any required modules like login, logout or register
const {login} = require("../controllers/authentication/loginController")
const {logout} = require("../controllers/authentication/logoutController")
const authentication = require("../middleware/authentication");



// use controllers with router method
router.post("/login", login);
router.post("/logout", authentication.isAuthenticated, logout);


// export the file as a module that could be imported somewhere else
module.exports = router;