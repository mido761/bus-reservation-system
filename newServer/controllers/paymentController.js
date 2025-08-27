import pool from "../db.js";

const getPayment = async (req, res) => {
  try {
    const getRoutes = `
    SELECT * FROM payment;
    `;

    const { rows } = await pool.query(getRoutes);
    const routes = rows;

    return res.status(200).json(routes);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


const addPayment = async (req, res) => {
    const {bookingId, transactionId,amount,paymentType} = req.body
};


const standAlonePayment = async (req, res) => {
    const {booking,payment,payment_method,trip} = req.body
};



const editPayment = async (req, res) => {

};

const deletPayment = async (req, res) => {

};

export {getPayment, addPayment, editPayment,deletPayment,standAlonePayment};