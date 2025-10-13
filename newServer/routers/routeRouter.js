import express from "express";
import authentication from "../middleware/authentication.js";
import { getRoutes, getRoutesWithStops, getRouteStops, addRoutes, linkStop, editRoutes, delRoutes } from "../controllers/routeController.js";

const router = express.Router();


router.get('/get-routes', getRoutes);
router.get('/get-routes-with-stops', getRoutesWithStops);
router.get('/get-route-stops/:routeId', getRouteStops);
router.post('/add-route', authentication.isAuthoraized, addRoutes);
router.post('/link-route-stop', authentication.isAuthoraized, linkStop);
router.put('/edit-route', authentication.isAuthoraized, editRoutes);
router.delete('/del-route', authentication.isAuthoraized, delRoutes);
export default router;