import express from "express";
import authentication from "../middleware/authentication.js";
import { getTrips, getTripsWithPassengerCounts, getUserTrips, addTrip, linkTripBus, editTrip, delTrip, getTrip ,  completeTrip, cancelTrip, getDriverTrips} from "../controllers/tripController.js";

const router = express.Router();


router.get('/get-driver-trips', authentication.isAuthoraized, getDriverTrips);
router.get('/get-trips', authentication.isAuthoraized, getTrips);
router.get("/get-trips-with-counts", authentication.isAuthenticated, getTripsWithPassengerCounts);
router.get('/get-user-trips', authentication.isAuthenticated, getUserTrips);
router.post('/get-trip', getTrip);
router.post('/link-trip-bus', authentication.isAuthoraized, linkTripBus);
router.post('/add-trip', authentication.isAuthoraized, addTrip);
router.put('/edit-trip/:tripId', authentication.isAuthoraized, editTrip);
router.post('/cancel-trip', authentication.isAuthoraized, cancelTrip);
router.post('/complete-trip', authentication.isAuthoraized, completeTrip);
router.delete('/del-trip', authentication.isAuthoraized, delTrip);


export default router;