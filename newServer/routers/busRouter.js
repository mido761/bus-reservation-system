import express from "express";
import { getAvailableBuses, addBus, editBus, delBus } from "../controllers/busController.js";

const router = express.Router();


router.get('/get-available-buses', getAvailableBuses);
router.post('/add-bus', addBus);
router.put('/edit-bus', editBus);
router.delete('/del-bus', delBus);


export default router;