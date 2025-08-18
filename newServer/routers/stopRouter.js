import express from "express";
import { getStops, addStop, editStop, delStop } from "../controllers/stopController.js";

const router = express.Router();

router.get('/get-stops', getStops);
router.post('/add-stop', addStop);
router.put('/edit-stop', editStop);
router.delete('/del-stop', delStop);


export default router;