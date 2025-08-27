import session from "express-session";
import axios from "axios";
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
    const {booking,payment,trip,route,stop} = req.body
    try{

    const userId = req.session.userId;
    const getUser = `SELECT username, email, phone_number FROM users WHERE user_id = $1`;
    const { rows } = await pool.query(getUser, [userId]);
    const user = rows[0];
    console.log([process.env.INTEGRATION_ID])
    // from session
    const First_Name = "mohamed";
    const Last_Name = "ahmed";
    // const Customer_Phone_Number = 12343423;
    // const customer_email = "modystar9999@gmail.com";
    ////// creating body
    const body = {
      amount: trip.price, // amount_cents must be equal to the sum of the items amounts
      currency: "EGP",
      payment_methods: [Number(process.env.INTEGRATION_ID)], //Enter your integration ID as an Integar, you can list multiple integration IDs as -> "payment_methods": [{{Integration_ID_1}}, {{Integration_ID_2}}, {{Integration_ID_3}}], so the user can choose the payment method within the checkout page

      items: [
        {
          name: "trip",
          amount: trip.price,
          description: `a trip from ${route.source} to ${route.destination} and pickup point is ${stop.stop_name}`,
          quantity: 1,
        },
      ],
      billing_data: {
        first_name: First_Name, // First Name, Last Name, Phone number, & Email are mandatory fields within sending the intention request
        last_name: Last_Name,
        phone_number: user.phone_number,
        city: "dumy",
        country: "dumy",
        email: user.email,
        floor: "dumy",
        state: "dumy",
      },

      extras: {
        ee: 22,
      },

      notification_url: `${process.env.BASE_URL}/api/webhook`,
      redirection_url: "http://localhost:5000/#/ticket-summary",
      //Notification and redirection URL are working only with Cards and they overlap the transaction processed and response callbacks sent per Integration ID
    };

    ///// the paymob api call
    const response = await axios.post(
      "https://accept.paymob.com/v1/intention/",
      body,
      {
        headers: {
          Authorization: `Token ${process.env.SECRET_KEY}`,
        },
      }
    );
    const PAYMENT_URL = `https://accept.paymob.com/api/acceptance/iframes/${process.env.IFRAME_ID}?payment_token=${response.data.payment_keys[0].key}`;
    
    return res.status(200).json({ PAYMENT_URL });


    }catch(error){
      console.log(error)
      return res.status(500).json({ message: error.message });
    }
};



const editPayment = async (req, res) => {

};

const deletPayment = async (req, res) => {

};

export {getPayment, addPayment, editPayment,deletPayment,standAlonePayment};