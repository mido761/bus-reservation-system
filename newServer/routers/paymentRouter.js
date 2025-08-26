import express from "express";
import { getPayment, addPayment, editPayment,deletPayment} from "../controllers/paymentController.js";

const router = express.Router();


router.get('/get-payment', getPayment);
router.post('/add-payment', addPayment);
router.put('/edit-payment', editPayment);
router.delete('/del-payment', deletPayment);
export default router;