import express from "express";
import {
  getSeats,
  getBusSeats,
  checkInOut,
} from "../controllers/seatController.js";

const router = express.Router();

router.get("/get-seats", getSeats);
router.get("/get-bus-seats/:busId", getBusSeats);
router.put("/check-in-out", checkInOut);
// router.post();
// router.put();
// router.delete();

export default router;
