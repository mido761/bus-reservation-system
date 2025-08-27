import express from "express";
import { getPayment, addPayment, webhookUpdate, editPayment,deletPayment,standAlonePayment} from "../controllers/paymentController.js";

const router = express.Router();


router.get('/get-payment', getPayment);
router.post("/webhook", webhookUpdate)
router.post('/stand-alone-payment',standAlonePayment)
router.post('/add-payment', addPayment);
router.put('/edit-payment', editPayment);
router.delete('/del-payment', deletPayment);

export default router;