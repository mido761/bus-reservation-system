import express from "express";
import authentication from "../middleware/authentication.js";
import { getTrips, getTripsWithPassengerCounts, getUserTrips, addTrip, linkTripBus, editTrip, delTrip,getTrip } from "../controllers/tripController.js";

const router = express.Router();


router.get('/get-trips', getTrips);
router.get("/get-trips-with-counts", getTripsWithPassengerCounts);
router.get('/get-user-trips', getUserTrips);
router.post('/get-trip', getTrip);
router.post('/link-trip-bus',  linkTripBus);
router.post('/add-trip', addTrip);
router.put('/edit-trip', editTrip);
router.delete('/del-trip', delTrip);


export default router;