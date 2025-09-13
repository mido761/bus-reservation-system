import axios from "axios";

export const paymentIntention = async (publicKey, secretKey, body) => {
  try {
    // Call Intention API
    const response = await axios.post(
      "https://accept.paymob.com/v1/intention/",
      body,
      { headers: { Authorization: `Token ${secretKey}` } }
    );

    // Send URL back
    const PAYMENT_URL = `https://accept.paymob.com/unifiedcheckout/?publicKey=${publicKey}&clientSecret=${response.data.client_secret}`;
    return PAYMENT_URL;
  } catch (err) {
    console.error("Error during payment process: ", err);
    throw err;
  }
};
// `https://accept.paymob.com/api/acceptance/iframes/${process.env.IFRAME_ID}?payment_token=${response.data.payment_keys[0].key}`;
