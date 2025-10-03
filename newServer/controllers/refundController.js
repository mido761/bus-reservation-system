// import axios from "axios";
import pool from "../db.js";
// import hmacVerifier from "../utils/hmacVerifier.js";
// import { buildPaymobBody } from "../helperfunctions/paymob/buildPaymobBody.js";
import { findOrCreatePayment } from "../paymob/findOrCreatePayment.js";
import { handlePaymobError } from "../paymob/handlePaymobError.js";
import { limitPaymentRetries } from "../paymob/countPaymentRetries.js";
// import { sendGridMail, nodeMailerMail } from "../utils/mailService.js";
// import { sendMail } from "../utils/nodeMailer.js";
// import { sendTicketEmail } from "../utils/sendTicketMail.js";
// import { sendRefundEmail } from "../utils/sendRefundMail.js";
// import { paymentIntention } from "../helperfunctions/paymob/standAlone/paymentIntention.js";
import { findUser } from "../paymob/findUser.js";
import { PaymobClient } from "../paymob/paymobClient.js";
import { standaloneUpdate } from "../helperfunctions/webhookFun/standalone.js";
import { rules } from "../helperfunctions/webhookFun/rules.js";
import { refundUpdate } from "../helperfunctions/webhookFun/refund.js";
import { confirmVfPayment } from "../VFcash/confirmPayment.js";
import { rejectVFPayment } from "../paymob/rejectVFPayment.js";


const getRefund = async (req, res) => {
    const {status,number} = req.body;
  try {
    if (status === "All"){
    const limit = number;
    const getRefundQuery = `
    SELECT * FROM refund
    LIMIT $1 
    `;
    const { rows } = await pool.query(getRefundQuery, [limit]);
    }
    else{
    const getrefundQuery = `
    select * from refund 
    where status = $1
    `;
    const { rows } = await pool.query(getrefundQuery, [status]);
    }
    
    const refund = rows;

    return res.status(200).json({ refunds: refund });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};



export {
getRefund
};
