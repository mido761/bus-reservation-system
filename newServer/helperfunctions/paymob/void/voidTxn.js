import axios from "axios";

export const voidTxn = async (secretKey, txnId) => {
  try {
    // Call Paymob
    const voidResponse = await axios.post(
      "https://accept.paymob.com/api/acceptance/void_refund/void",
      { transaction_id: txnId },
      { headers: { Authorization: `Token ${secretKey}` } }
    );

    return voidResponse.data; // ✅ return the response
  } catch (err) {
    // Enhance error handling
    if (err.response) {
      throw new Error(
        `Paymob API error (${err.response.status}): ${JSON.stringify(
          err.response.data
        )}`
      );
    }
    throw new Error(`Transaction Void failed: ${err.message}`);
  }
};
