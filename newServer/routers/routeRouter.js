const express = require("express");
const router = express.Router();
const {getRoutes} = require('../controllers/routeController');


router.get('/get-routes', getRoutes);


module.exports = router;