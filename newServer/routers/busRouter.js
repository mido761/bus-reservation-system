const express = require("express");
const router = express.Router();
const {getAvailableBuses} = require('../controllers/busController');


router.get('/get-available-buses', getAvailableBuses);


module.exports = router;