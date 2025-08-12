const express = require("express");
const router = express.Router();
const {getAvailableBuses} = require('../controllers/busController');
const {addBus} = require('../controllers/busController');
const {editBus} = require('../controllers/busController');
const {delBus} = require('../controllers/busController');


router.get('/get-available-buses', getAvailableBuses);
router.post('/add-buses', addBus);
router.put('/edit-buses', editBus);
router.delete('/del-buses', delBus);


module.exports = router;