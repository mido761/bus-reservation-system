import express from "express";
import { login } from "../controllers/authentication/loginController.js";
import { logout } from "../controllers/authentication/logoutController.js";
import authentication from "../middleware/authentication.js";

const router = express.Router(); // used for controllers reference



// use controllers with router method
router.post("/login", login);
router.post("/logout", authentication.isAuthenticated, logout);


// export the file as a module that could be imported somewhere else
export default router;