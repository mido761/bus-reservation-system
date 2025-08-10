const expres = require('express');
const router = expres.Router();
const authentication = require("../middleware/authentication");

const {getSchedules, addSchedule} = require('../controllers/scheduleController');


router.get('/get-schedules', authentication.isAuthoraized, getSchedules);
router.post('/add-schedule', authentication.isAuthoraized, addSchedule);


module.exports = router;