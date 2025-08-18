import express from "express";
import authentication from "../middleware/authentication.js";
import { getSchedules, addSchedule } from "../controllers/scheduleController.js";

const router = express.Router();


router.get('/get-schedules', authentication.isAuthoraized, getSchedules);
router.post('/add-schedule', authentication.isAuthoraized, addSchedule);


export default router;