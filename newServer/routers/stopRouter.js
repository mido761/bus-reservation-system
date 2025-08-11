const express = require("express");
const router = express.Router();
const {getStops} = require('../controllers/stopController');
const {addStop} = require('../controllers/stopController');
const {editStop} = require('../controllers/stopController');
const {delStop} = require('../controllers/stopController');

router.get('/get-stops', getStops);
router.post('/add-stop', addStop);
router.put('/edit-stop', editStop);
router.delete('/del-stop', delStop);


module.exports = router;