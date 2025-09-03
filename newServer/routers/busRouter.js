import express from "express";
import { getAvailableBuses, getBusDetails, addBus, editBus, delBus } from "../controllers/busController.js";

const router = express.Router();


router.get('/get-available-buses', getAvailableBuses);
router.get('/get-bus/:busId', getBusDetails);
router.post('/add-bus', addBus); 
router.put('/edit-bus', editBus);
router.delete('/del-bus', delBus);


export default router;