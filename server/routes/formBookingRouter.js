const express = require("express");
const router = express.Router();
const {getFormDetails, bookSpot, cancelSpot} = require("../controllers/formBookingController");


// retrieve bus details
router.get("/:id", getFormDetails);


// book seat endpoint
router.post("/:busId", bookSpot);


// cancel seat endpoint
router.delete("/:busId", cancelSpot);
