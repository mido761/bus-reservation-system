import express from "express";
import { getRoutes, addRoutes, editRoutes, delRoutes } from "../controllers/routeController.js";

const router = express.Router();


router.get('/get-routes', getRoutes);
router.post('/add-route', addRoutes);
router.put('/edit-route', editRoutes);
router.delete('/del-route', delRoutes);
export default router;