import express from "express";
import { getUserPayments, getPaymentByBooking, addPayment, webhook, editPayment, refundPayment, standAlonePayment,vodafoneCash,getPaymentByTrx,confirmPayment} from "../controllers/paymentController.js";

const router = express.Router();


router.get('/get-user-payments', getUserPayments);
router.get('/by-booking', getPaymentByBooking);
router.get("/by-trx",getPaymentByTrx)
router.post("/webhook", webhook);
// router.post("/webhook-refund", webhookRefund)
router.post('/stand-alone-payment',standAlonePayment);
router.post('/vodafonecash-payment',vodafoneCash);
router.post('/confirm-VF-payment',confirmPayment);
router.post('/add-payment', addPayment);
router.put('/edit-payment', editPayment);
router.post('/refund', refundPayment);

export default router;