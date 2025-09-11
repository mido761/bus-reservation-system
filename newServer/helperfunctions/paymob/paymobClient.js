import { captureTxn } from "./authAndCap/captureTxn.js";
import { buildPaymobBody } from "./buildPaymobBody.js";
import { fetchPaymobAuthToken } from "./fetchPaymobAuthToken.js";
import { refundTxn } from "./refund/refundTxn.js";
import { paymentIntention } from "./standAlone/paymentIntention.js";
import { getTxnDetails } from "./TxnInquiry/getTxnDetails.js";
import { voidTxn } from "./void/voidTxn.js";

export class PaymobClient {
  constructor({ publicKey, secretKey, apiKey }) {
    this.publicKey = publicKey;
    this.secretKey = secretKey;
    this.apiKey = apiKey;
  }

  fetchAuthToken() {
    return fetchPaymobAuthToken(this.apiKey);
  }

  buildBody(integrationIds, payment, user, booking, trip, route){
    return buildPaymobBody(integrationIds, payment, user, booking, trip, route);
  }

  createIntention(body) {
    return paymentIntention(this.publicKey, this.secretKey, body);
  }

  getTxn(token, type, id){
    return getTxnDetails(token, type, id)
  }

  refund(txnId, amount) {
    return refundTxn(this.secretKey, txnId, amount);
  }

  void(txnId) {
    return voidTxn(this.secretKey, txnId);
  }

  capture(txnId, amount) {
    return captureTxn(this.secretKey, txnId, amount);
  }
}
