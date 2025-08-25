import express from "express";
import { getRoutes, getRoutesWithStops, getRouteStops, addRoutes, linkStop, editRoutes, delRoutes } from "../controllers/routeController.js";

const router = express.Router();


router.get('/get-routes', getRoutes);
router.get('/get-routes-with-stops', getRoutesWithStops);
router.get('/get-route-stops/:routeId', getRouteStops);
router.post('/add-route', addRoutes);
router.post('/link-route-stop', linkStop);
router.put('/edit-route', editRoutes);
router.delete('/del-route', delRoutes);
export default router;