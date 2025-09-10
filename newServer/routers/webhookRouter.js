import express from "express";
import { webhookStandalone,webhookRefund,webhookAuth,webhookCap,webhookVoid} from "../controllers/webhookController.js";

const router = express.Router();

router.post("/standalone", webhookStandalone)
router.post("/refund", webhookRefund)
router.post("/auth", webhookAuth)
router.post("/cap", webhookCap)
router.post("/void", webhookVoid)
export default router;
