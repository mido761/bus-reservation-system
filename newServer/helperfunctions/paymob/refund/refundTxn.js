import axios from "axios";

export const refundTxn = async (secretKey, txnId, amount) => {
  try {
    // Call Paymob
    const refundResponse = await axios.post(
      "https://accept.paymob.com/api/acceptance/void_refund/refund",
      { transaction_id: txnId, amount: amount },
      { headers: { Authorization: `Token ${secretKey}` } }
    );

    return refundResponse.data; // ✅ return the response
  } catch (err) {
    throw err
    // Enhance error handling
    // if (err.response) {
    //   throw new Error(
    //     `Paymob API error (${err.response.status}): ${JSON.stringify(
    //       err.response.data
    //     )}`
    //   );
    // }
    // throw new Error(`Transaction Void failed: ${err.message}`);
  }
};
