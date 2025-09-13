import axios from "axios";

export const getTxnDetails = async (token, type, id) => {
  try {
    // Validate type
    const validTypes = ["transaction_id", "order_id", "merchant_order_id"];
    if (!validTypes.includes(type)) {
      throw new Error(
        `Invalid type. Must be one of: ${validTypes.join(", ")}`
      );
    }

    // Build request body dynamically
    const requestBody = { [type]: id };

    // Call Paymob
    const inquiryResponse = await axios.post(
      "https://accept.paymob.com/api/ecommerce/orders/transaction_inquiry",
      requestBody,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return inquiryResponse.data; // ✅ return the response
  } catch (err) {
    // Enhance error handling
    if (err.response) {
      throw new Error(
        `Paymob API error (${err.response.status}): ${JSON.stringify(
          err.response.data
        )}`
      );
    }
    throw new Error(`Transaction inquiry failed: ${err.message}`);
  }
};
