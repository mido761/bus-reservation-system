import express from "express";
import { getUserPayments, addPayment, editPayment,deletPayment,standAlonePayment} from "../controllers/paymentController.js";

const router = express.Router();


router.get('/get-user-payments', getUserPayments);
// router.post("/webhook-standalone", webhookStandalone)
// router.post("/webhook-refund", webhookRefund)
router.post('/stand-alone-payment',standAlonePayment)
router.post('/add-payment', addPayment);
router.put('/edit-payment', editPayment);
router.delete('/del-payment', deletPayment);

export default router;