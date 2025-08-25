import express from "express";
import { getStops, addStop, editStop, delStop, getStopsRoute } from "../controllers/stopController.js";

const router = express.Router();

router.get('/get-stops', getStops);
router.get('/get-stops-route/:routeId', getStopsRoute);
router.post('/add-stop', addStop);
router.put('/edit-stop', editStop);
router.delete('/del-stop', delStop);


export default router;