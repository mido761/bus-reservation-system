import express from "express";
import {
  getSeats,
  getBusSeats,
  checkIn,
  cancelCheckIn,
} from "../controllers/seatController.js";

const router = express.Router();

router.get("/get-seats", getSeats);
router.get("/get-bus-seats/:busId", getBusSeats);
router.put("/check-in", checkIn);
router.put("/cancel-check-in", cancelCheckIn);
// router.post();
// router.put();
// router.delete();

export default router;
