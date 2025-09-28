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

const getUserPayments = async (req, res) => {
  try {
    const getUserPaymentsQ = `
    SELECT 
      payment.payment_id,
      payment.amount,
      payment.payment_method,
      payment.payment_status,
      payment.created_at,
      payment.updated_at
    FROM payment
    JOIN booking 
      ON payment.booking_id = booking.booking_id
    WHERE booking.passenger_id = $1
    ORDER BY payment.created_at DESC, payment.updated_at DESC
    `;

    const { rows } = await pool.query(getUserPaymentsQ, [req.session.userId]);
    const payments = rows;

    return res.status(200).json({ user_payments: payments });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getPaymentByBooking = async (req, res) => {
  const { bookingId } = req.query;
  console.log(bookingId);
  try {
    const getPaymentByBookingQ = `
    SELECT 
      p.payment_id,
      p.amount,
      p.payment_method,
      p.payment_status,
      p.created_at,
      p.updated_at
    FROM payment p
    JOIN booking b ON b.passenger_id = $1 
    WHERE b.booking_id = $2
    ORDER BY p.created_at DESC, p.updated_at DESC
    LIMIT 1
    `;

    const { rows } = await pool.query(getPaymentByBookingQ, [
      req.session.userId,
      bookingId,
    ]);
    const payment = rows[0];
    console.log(rows[0]);

    // Paymob CLient
    const paymob = new PaymobClient({
      publicKey: process.env.PUBLIC_KEY,
      secretKey: process.env.SECRET_KEY,
      apiKey: process.env.API_KEY,
    });
    [];

    const token = await paymob.fetchAuthToken();
    try {
      const txnDetails = await paymob.getTxn(
        token,
        "merchant_order_id",
        payment.payment_id
      );

      const paymob_payment_status = txnDetails.order.payment_status || null;
    } catch (err) {
      console.log("Txn Not Found!");
    }

    return res.status(200).json({ user_payment: payment });
  } catch (error) {
    console.error("Error getting payment: ", error);
    return res.status(500).json({ message: error.message });
  }
};

const getPaymentByTrx =  async (req, res) => {
  const { transactionId } = req.query;
  console.log(transactionId)
  try {
    const getPaymentByBookingQ = `
    SELECT 
        p.payment_id,
        p.amount,
        p.payment_method,
        p.payment_status,
        p.created_at AS payment_created_at,
        p.updated_at AS payment_updated_at,
        
        b.booking_id,
        b.seat_id,
        b.booked_at AS booking_created_at,
        
        u.user_id,
        u.username AS passenger_name,
        u.email AS passenger_email,
        u.phone_number AS passenger_phone

    FROM payment p
    JOIN booking b ON b.booking_id = p.booking_id
    JOIN users u ON u.user_id = b.passenger_id
    WHERE p.transaction_id = $1
    ORDER BY p.created_at DESC, p.updated_at DESC;
    `;

    const { rows } = await pool.query(getPaymentByBookingQ, [
      transactionId,
    ]);
    const payment = rows;
    // console.log(rows);

    return res.status(200).json({ user_payment: payment });
  } catch (error) {
    console.error("Error getting payment: ", error);
    return res.status(500).json({ message: error.message });
  }
}; 

const addPayment = async (req, res) => {
  const { bookingId, transactionId, amount, paymentType } = req.body;
};

// 🔹 Main function
const standAlonePayment = async (req, res) => {
  const { booking, trip, route } = req.body;
  try {
    // limit retries
    const limit = await limitPaymentRetries(booking.booking_id);
    if (limit.length > 0) {
      return res.status(429).json({
        message: `Maximum payment attempts reached (3). Please contact support.`,
      });
    }

    // Step 1: Get user
    const user = await findUser(req.session.userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    // Step 2: Get pending payment or create a new one
    const payment = await findOrCreatePayment(booking.booking_id, trip.price);
    if (payment.payment_status === "paid") {
      return res.status(400).json({ message: "Payment already completed." });
    }
    if (["failed", "expired"].includes(payment.payment_status)) {
      return res
        .status(400)
        .json({ message: "This payment session is no longer valid." });
    }

    // Paymob CLient
    const paymob = new PaymobClient({
      publicKey: process.env.PUBLIC_KEY,
      secretKey: process.env.SECRET_KEY,
      apiKey: process.env.API_KEY,
    });

    // Step 3: Build Paymob body & call API
    const body = paymob.buildBody(
      [Number(process.env.INTEGRATION_ID)],
      payment,
      user,
      booking,
      trip,
      route
    );
    const PAYMENT_URL = await paymob.createIntention(body);

    return res.status(200).json({ PAYMENT_URL });
  } catch (error) {
    try {
      await handlePaymobError(error);
      return res.status(400).json({ message: "Payment already succeeded." });
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  }
};

// 🔹 Main function
const vodafoneCash = async (req, res) => {
  const { booking_id, trip, route, trx, senderNumber } = req.body;
  try {
    // limit retries
    // const limit = await limitPaymentRetries(booking.booking_id);
    // if (limit.length > 0) {
    //   return res.status(429).json({
    //     message: `Maximum payment attempts reached (3). Please contact support.`,
    //   });
    // }

    // Step 1: Get user
    const user = await findUser(req.session.userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const validatePhoneNumber = (number) =>
      /^\d{11}$/.test(number) && number.startsWith("01");

    if (!validatePhoneNumber(senderNumber)) {
      return res.status(400).json({ message: "Incorrect phone number!" });
    }
    
    // Step 2: Get pending payment or create a new one
    const payment = await findOrCreatePayment(
      booking_id,
      trip.price,
      trx,
      senderNumber
    );
    // if (payment.payment_status === "paid") {
    //   console.log(payment)
    //   return res.status(400).json({ message: "Payment already completed!" });
    // }
    // if (["failed", "expired"].includes(payment.payment_status)) {
    //   return res
    //     .status(400)
    //     .json({ message: "This payment session is no longer valid." });
    // }

    return res.status(200).json({ payment });
  } catch (error) {
    // try {
    //   return res.status(400).json({ message: "Payment succeeded." });
    // } catch (err) {
      return res.status(400).json({ message: error.message });
    // }
  }
};

// const webhook = async (req, res) => {
//   console.log("POST /payment/webhook called");

//   const client = await pool.connect();
//   try {
//     const payload = req.body;
//     const obj = payload.obj || {};
//     const paymentId = obj.order?.merchant_order_id;
//     const transactionId = obj.id;
//     const success = obj.success === true || obj.success === "true";

//     // Validate
//     if (!paymentId || !transactionId) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     if (!hmacVerifier(payload, req.query.hmac)) {
//       return res.status(400).json({ error: "Invalid HMAC signature" });
//     }

//     // Determine status
//     const newStatus = success ? "paid" : "failed";
//     const paymentMethod = `${obj.source_data?.type || "N/A"} | ${
//       obj.source_data?.sub_type || "N/A"
//     }`;
//     console.log(obj.is_refunded);
//     //   if(obj.is_refunded){
//     //      await client.query("BEGIN");

//     //   // Update payment with idempotence check
//     //   const paymentUpdate = await client.query(
//     //     `UPDATE payment
//     //      SET payment_status = 'refunded',
//     //          updated_at = NOW()
//     //      WHERE payment_id = $1
//     //        AND payment_status = 'paid'
//     //      RETURNING booking_id`,
//     //     [paymentId]
//     //   );

//     //   if (paymentUpdate.rowCount === 0) {
//     //     await client.query("ROLLBACK");
//     //     return res
//     //       .status(409)
//     //       .json({ error: "Payment already refunded or not found" });
//     //   }

//     //   const bookingId = paymentUpdate.rows[0].booking_id;
//     //   const userId = paymentUpdate.rows[0].user_id;
//     //   // console.log(obj.amount)
//     //   const amountCents = Number(obj.amount_cents);
//     //   if (isNaN(amountCents)) {
//     //     throw new Error("Invalid amount in webhook payload");
//     //   }

//     //   const amount = Math.floor(amountCents / 100);
//     //   // 2) Insert refund record (new transaction)
//     //   const refundInsert = await client.query(
//     //     `INSERT INTO refund (payment_id, refund_transaction_id,reason, amount,status, created_at)
//     //      VALUES ($1, $2, $3, $4,'refunded', NOW())
//     //      RETURNING refund_id`,
//     //     [paymentId, transactionId, "bec I am" , amount]
//     //   );

//     //   const refundId = refundInsert.rows[0].refund_id;

//     //   // 3) Update booking
//     //   await client.query(
//     //     `UPDATE booking
//     //      SET status = 'cancelled',
//     //          priority = NULL,
//     //          updated_at = NOW()
//     //      WHERE booking_id = $1`,
//     //     [bookingId]
//     //   );
//     //  // 4) Update tickets
//     //   await client.query(
//     //     `UPDATE tickets
//     //      SET status = 'cancelled',
//     //          updated_at = NOW()
//     //      WHERE booking_id = $1`,
//     //     [bookingId]
//     //   );
//     //       // 5) Send refund email (optional)
//     //   try {
//     //     const userEmail = obj.order.shipping_data.email;
//     //     await sendRefundEmail(userEmail, {
//     //       bookingId,
//     //       refundId,
//     //       transactionId,
//     //       amount,
//     //     });
//     //      res.status(200).json({ success: true, message: "Refund processed", refundId });
//     //   } catch (err) {
//     //     console.error("Refund email failed:", err.message);
//     //   }

//     //   await client.query("COMMIT");
//     //     // console.log(payload)
//     //     // return  res.status(200).json({message: payload});
//     //   }

//     if (obj.is_standalone_payment) {
//       await client.query("BEGIN");
//       // Update payment with idempotence check
//       const amountCents = Number(obj.amount_cents);
//       if (isNaN(amountCents)) {
//         throw new Error("Invalid amount in webhook payload");
//       }

//       const amount = Math.floor(amountCents / 100);
//       const paymentUpdate = await client.query(
//         `UPDATE payment
//        SET payment_status = $1,
//            transaction_id = $2,
//            payment_method = $3,
//            amount = $4,
//            captured_status = 'capture',
//            updated_at = NOW()
//        WHERE payment_id = $5
//          AND payment_status = 'pending'
//        RETURNING booking_id`,
//         [newStatus, transactionId, paymentMethod, amount, paymentId]
//       );

//       if (paymentUpdate.rowCount === 0) {
//         await client.query("ROLLBACK");
//         return res
//           .status(409)
//           .json({ error: "Payment already processed or not found" });
//       }

//       const bookingId = paymentUpdate.rows[0].booking_id;

//       if (success) {
//         // Only update booking if payment succeeded
//         await client.query(
//           `UPDATE booking
//          SET status = $1,
//              priority = $2,
//              updated_at = NOW()
//          WHERE booking_id = $3`,
//           ["confirmed", 1, bookingId]
//         );

//         // Create and send ticket email
//         try {
//           const getTicketQ = `
//           SELECT
//             booking.booking_id,
//             tickets.ticket_id,
//             users.username,
//             tickets.seat_number,
//             trips.date,
//             trips.departure_time,
//             trips.price,
//             route.source,
//             route.destination,
//             stop.stop_name
//           FROM booking
//           JOIN trips
//             ON booking.trip_id = trips.trip_id
//           JOIN users
//             ON booking.passenger_id = users.user_id
//           JOIN tickets
//             ON booking.booking_id = tickets.booking_id
//           LEFT JOIN route
//             ON trips.route_id = route.route_id
//           LEFT JOIN stop
//             ON booking.stop_id = stop.stop_id
//           LEFT JOIN seat
//             ON booking.seat_id = seat.seat_id
//           WHERE booking.booking_id = $1
//           LIMIT 1
//           `;

//           const { rows: userTicket } = await pool.query(getTicketQ, [
//             bookingId,
//           ]);

//           const ticket = userTicket[0];

//           const userEmail = obj.order.shipping_data.email;
//           await sendTicketEmail(userEmail, ticket);
//           await client.query(
//             "UPDATE tickets SET email_status = 'sent', email_sent_at = NOW(), updated_at = NOW(), status = 'issued' WHERE booking_id = $1",
//             [bookingId]
//           );
//         } catch (err) {
//           await client.query(
//             "UPDATE tickets SET email_status = 'failed' WHERE booking_id = $1",
//             [bookingId]
//           );
//         }
//       }

//       await client.query("COMMIT");
//       return res.status(200).json({ ok: true });
//     }
//     return res.status(400).json({ ok: false });
//   } catch (err) {
//     await client.query("ROLLBACK");
//     console.error("Webhook error:", err);

//     if (err.code === "22P02") {
//       return res.status(400).json({ error: "Invalid UUID format" });
//     }

//     return res.status(500).json({ error: "Internal server error" });
//   } finally {
//     client.release();
//   }
// };

const webhook = async (req, res) => {
  console.log("POST /payment/webhook called");

  const client = await pool.connect();
  try {
    const payload = req.body;
    const obj = payload.obj || {};
    const paymentId = obj.order?.merchant_order_id;
    const transactionId = obj.id;
    const success = obj.success === true || obj.success === "true";

    // Validate
    // if (!paymentId || !transactionId) {
    //   return res.status(400).json({ error: "Missing required fields" });
    // }

    // if (!hmacVerifier(payload, req.query.hmac)) {
    //   return res.status(400).json({ error: "Invalid HMAC signature" });
    // }

    if (!success) return res.status(400).json({ ok: false });

    // Determine status
    const newStatus = success ? "paid" : "failed";
    const paymentMethod = `${obj.source_data?.type || "N/A"} | ${
      obj.source_data?.sub_type || "N/A"
    }`;

    const amount_cents = obj.amount_cents;
    const userEmail = obj.order.shipping_data.email;

    console.log(obj.is_refund, obj.is_standalone_payment);
    const rule = rules.find((r) => r.match(obj));

    console.log("Checking rule match in webhook...");
    for (const r of rules) {
      try {
        const didMatch = r.match(obj);
        console.log("Checking rule:", r.action, "->", didMatch);
      } catch (err) {
        console.error("Error in rule check:", r.action, err);
      }
    }

    console.log(rule);
    switch (rule.action) {
      case "standAlone":
        const standalone = await standaloneUpdate(
          client,
          newStatus,
          transactionId,
          paymentMethod,
          amount_cents,
          paymentId
        );
        console.log(standalone);
        break;
      case "refund":
        const refund = await refundUpdate(
          client,
          userEmail,
          transactionId,
          amount_cents,
          paymentId
        );
        console.log(refund);
        break;
      case "auth":
        break;
      case "capture":
        break;
      case "void":
        break;
      default:
        console.log("No match");
    }

    return res.status(200).json({ ok: true });
    // }
    // return res.status(400).json({ ok: false });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Webhook error:", err);

    if (err.code === "22P02") {
      return res.status(400).json({ error: "Invalid UUID format" });
    }

    return res
      .status(err.status || 500)
      .json({ error: err.message || "Internal server error" });
  } finally {
    client.release();
  }
};
let tareq =
  "dummy line for not mixing the two commented functions until i finish";

const confirmPayment = async (req, res) => {
  // console.log("POST /payment/confirm called");

  const client = await pool.connect();
  try {
    const {bookingId} = req.body;

    const confirm = await confirmVfPayment(
      client,
      bookingId
    );
    console.log(confirm);

    return res.status(200).json({ user_info: confirm,  });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Confrim error:", err);

    if (err.code === "22P02") {
      return res.status(400).json({ error: "Invalid UUID format" });
    }

    return res
      .status(err.status || 500)
      .json({ error: err.message || "Internal server error" });
  } finally {
    client.release();
  }
};

// const webhookRefund = async (req,res) => {

//   console.log("POST /refund/webhook called");
//   const client = await pool.connect();
//   try {
//     const payload = req.body;
//     const obj = payload.obj || {};
//     const paymentId = obj.order?.merchant_order_id;
//     const transactionId = obj.id;
//     const success = obj.success === true || obj.success === "true";

//     // Validate
//     if (!paymentId || !transactionId) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     if (!hmacVerifier(payload, req.query.hmac)) {
//       return res.status(400).json({ error: "Invalid HMAC signature" });
//     }

//     // Determine status
//     const newStatus = success ? "paid" : "failed";
//     const paymentMethod = `${obj.source_data?.type || "N/A"} | ${
//       obj.source_data?.sub_type || "N/A"
//     }`;
//     console.log(obj.is_refunded)
//     if(obj.is_refunded){
//        await client.query("BEGIN");

//     // Update payment with idempotence check
//     const paymentUpdate = await client.query(
//       `UPDATE payment
//        SET payment_status = 'refunded',
//            updated_at = NOW()
//        WHERE payment_id = $1
//          AND payment_status = 'paid'
//        RETURNING booking_id`,
//       [paymentId]
//     );

//     if (paymentUpdate.rowCount === 0) {
//       await client.query("ROLLBACK");
//       return res
//         .status(409)
//         .json({ error: "Payment already refunded or not found" });
//     }

//     const bookingId = paymentUpdate.rows[0].booking_id;
//     const userId = paymentUpdate.rows[0].user_id;
//     // console.log(obj.amount)
//     const amountCents = Number(obj.amount_cents);
//     if (isNaN(amountCents)) {
//       throw new Error("Invalid amount in webhook payload");
//     }

//     const amount = Math.floor(amountCents / 100);
//     // 2) Insert refund record (new transaction)
//     const refundInsert = await client.query(
//       `INSERT INTO refund (payment_id, refund_transaction_id,reason, amount,status, created_at)
//        VALUES ($1, $2, $3, $4,'refunded', NOW())
//        RETURNING refund_id`,
//       [paymentId, transactionId, "bec I am" , amount]
//     );

//     const refundId = refundInsert.rows[0].refund_id;

//     // 3) Update booking
//     await client.query(
//       `UPDATE booking
//        SET status = 'cancelled',
//            priority = NULL,
//            updated_at = NOW()
//        WHERE booking_id = $1`,
//       [bookingId]
//     );
//    // 4) Update tickets
//     await client.query(
//       `UPDATE tickets
//        SET status = 'cancelled',
//            updated_at = NOW()
//        WHERE booking_id = $1`,
//       [bookingId]
//     );
//         // 5) Send refund email (optional)
//     try {
//       const userEmail = obj.order.shipping_data.email;
//       await sendRefundEmail(userEmail, {
//         bookingId,
//         refundId,
//         transactionId,
//         amount,
//       });
//        res.status(200).json({ success: true, message: "Refund processed", refundId });
//     } catch (err) {
//       console.error("Refund email failed:", err.message);
//     }

//     await client.query("COMMIT");
//       // console.log(payload)
//       // return  res.status(200).json({message: payload});
//     return res.status(200).json({ ok: true});
//     }
//     return res.status(400).json({ ok: false});

//   } catch (err) {
//     await client.query("ROLLBACK");
//     console.error("Webhook error:", err);

//     if (err.code === "22P02") {
//       return res.status(400).json({ error: "Invalid UUID format" });
//     }

//     return res.status(500).json({ error: "Internal server error" });
//   } finally {
//     client.release();
//   }
// };

const editPayment = async (req, res) => {};

const refundPayment = async (req, res) => {
  const { paymentId } = req.body;
  let transaction_id,
    amount,
    booking_id,
    paymob_payment_status,
    paymob_refund_status;
  try {
    const getPaymentQ = `
    SELECT transaction_id, amount, booking_id, payment_status
    FROM payment
    WHERE payment_id = $1
    LIMIT 1
    `;
    const { rows: paymentRows } = await pool.query(getPaymentQ, [paymentId]);

    const paymentStatus = paymentRows[0].payment_status;
    if (paymentStatus === "refunded") {
      return res.status(400).json({ message: "Payment already refunded!" });
    }
    ({ transaction_id, amount, booking_id } = paymentRows[0]);

    const getBookingQ = `
    SELECT passenger_id
    FROM booking
    WHERE booking_id = $1
    LIMIT 1
    `;
    const { rows: bookingRows } = await pool.query(getBookingQ, [booking_id]);
    const passengerId = bookingRows[0].passenger_id;
    const userId = req.session.userId;
    if (userId !== passengerId) {
      return res.status(403).json({ message: "Unauthorized action!" });
    }

    // Paymob CLient
    const paymob = new PaymobClient({
      publicKey: process.env.PUBLIC_KEY,
      secretKey: process.env.SECRET_KEY,
      apiKey: process.env.API_KEY,
    });

    if (!transaction_id) {
      const token = await paymob.fetchAuthToken();

      const txnDetails = await paymob.getTxn(
        token,
        "merchant_order_id",
        paymentId
      );

      transaction_id = txnDetails.id || null;
      amount = txnDetails.amount_cents / 100 || null;
      paymob_payment_status = txnDetails.order.payment_status || null;
      paymob_refund_status = txnDetails.data.migs_order.status || null;
      // console.log("Transaction details: ", txnDetails);
      // console.log("Payment status: ", paymob_payment_status);
      // console.log("Refund status: ", paymob_refund_status);
      // console.log("Amount: ", amount);
    }
    console.log("Txn ID: ", transaction_id);

    if (paymob_refund_status === "REFUNDED") {
      const client = await pool.connect();
      const refund = await refundUpdate(
        client,
        null,
        transaction_id,
        amount,
        paymentId
      );
      console.log(refund);
      return res.status(400).json({ message: "Payment already refunded!" });
    }

    const refundRes = await paymob.refund(transaction_id, amount);

    console.log("Refund res: ", refundRes);
    return res
      .status(200)
      .json({ message: "Refund request sent successfully" });
  } catch (err) {
    console.error("Error processing refund: ", err);
    if (
      err.status === 400 &&
      err.response.data.message === "Full Amount has been already refunded"
    ) {
      // const paymentUpdate = await pool.query(
      //   `UPDATE payment
      //     SET payment_status = 'refunded',
      //      updated_at = NOW()
      //     WHERE payment_id = $1
      //     AND payment_status = 'paid'
      //     RETURNING booking_id`,
      //   [paymentId]
      // );
      const client = await pool.connect();

      try {
        const refund = await refundUpdate(
          client,
          null,
          transaction_id,
          amount * 1000,
          paymentId
        );
        console.log(refund);
      } catch (err) {
        console.error("Error updating: ", err);
      }

      return res.status(400).json({ message: "Payment already refunded!" });
    }
    return res
      .status(500)
      .json({ message: "Error processing refund!", error: err });
  }
};

export {
  getUserPayments,
  getPaymentByBooking,
  addPayment,
  webhook,
  editPayment,
  refundPayment,
  standAlonePayment,
  vodafoneCash,
  getPaymentByTrx,
  confirmPayment,
};
