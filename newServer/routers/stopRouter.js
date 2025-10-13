import express from "express";
import authentication from "../middleware/authentication.js";
import { getStops, addStop, editStop, delStop, getStopsRoute } from "../controllers/stopController.js";

const router = express.Router();

router.get('/get-stops', getStops);
router.get('/get-stops-route/:routeId', getStopsRoute);
router.post('/add-stop', authentication.isAuthoraized, addStop);
router.put('/edit-stop', authentication.isAuthoraized, editStop);
router.delete('/del-stop', authentication.isAuthoraized, delStop);


export default router;