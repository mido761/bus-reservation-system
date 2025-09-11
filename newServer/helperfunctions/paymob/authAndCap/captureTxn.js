import axios from "axios";

export const captureTxn = async (secretKey, txnId, amount) => {
  try {
    // Call Paymob
    const captureResponse = await axios.post(
      "https://accept.paymob.com/api/acceptance/capture",
      { transaction_id: txnId, amount: amount },
      { headers: { Authorization: `Token ${secretKey}` } }
    );

    return captureResponse.data; // ✅ return the response
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
