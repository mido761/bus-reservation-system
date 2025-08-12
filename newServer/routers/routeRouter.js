const express = require("express");
const router = express.Router();
const {getRoutes} = require('../controllers/routeController');
const {addRoutes} = require('../controllers/routeController');
const {editRoutes} = require('../controllers/routeController');
const {delRoutes} = require('../controllers/routeController');


router.get('/get-routes', getRoutes);
router.post('/add-route', addRoutes);
router.put('/edit-route', editRoutes);
router.delete('/del-route', delRoutes);
module.exports = router;