import express from "express";
import authentication from "../middleware/authentication.js";
import { getTrips, addTrip, linkTripBus, editTrip, delTrip,getTrip } from "../controllers/tripController.js";

const router = express.Router();


router.get('/get-trips', authentication.isAuthoraized, getTrips);
router.get('/get-trip', authentication.isAuthoraized, getTrip);
router.post('/link-trip-bus', authentication.isAuthoraized, linkTripBus);
router.post('/add-trip',authentication.isAuthoraized , addTrip);
router.put('/edit-trip', authentication.isAuthoraized, editTrip);
router.delete('/del-trip', authentication.isAuthoraized, delTrip);


export default router;