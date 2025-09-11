import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import formatDateAndTime from "../../../formatDateAndTime";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const statusStyles = {
  paid: "bg-green-100 text-green-800",
  pending: "bg-blue-100 text-blue-800",
  failed: "bg-red-100 text-red-800",
};

const MyPayments = () => {
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState(false);
  const [payments, setPayments] = useState([]);

  const fetchPayments = async () => {
    try {
      await axios.get(`${backEndUrl}/auth`, { withCredentials: true }); // authenticate
      const res = await axios.get(`${backEndUrl}/payment/get-user-payments`, {
        withCredentials: true,
      });
      setPayments(res.data.user_payments || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefundReq = async (e, paymentId) => {
    e.preventDefault();
    setLoadingId(paymentId);
    try {
      const refundRes = await axios.post(
        `${backEndUrl}/payment/refund`,
        { paymentId },
        {
          withCredentials: true,
        }
      );
      
      toast.success(refundRes.data.message);
    } catch (error) {
      console.error("Error during refund: ", error);
      const msg =
        error.response?.data?.message || // backend error format
        error.response?.data?.error || // in case it's under "error"
        error.message; // fallback

      toast.error(msg || "Error during refund!");
    } finally {
      setLoadingId(null);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Loading your payments...
      </div>
    );

  if (!payments.length)
    return (
      <div className="flex justify-center items-center h-64 text-gray-400">
        No payments history yet.
      </div>
    );

  return (
    <div className="max-w-full md:max-w-5xl mx-auto px-4">
      <h2 className="text-2xl font-semibold">My Payments</h2>

      <div className="grid gap-6 md:grid-cols-2">
        {payments.map((payment, idx) => (
          <Card
            key={payment.payment_id || idx}
            className="w-full shadow-md hover:shadow-lg transition-all rounded-xl p-5 bg-white"
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-800">
                Payment:{" "}
                <span className="text-indigo-600">{payment.amount} EGP</span>
              </CardTitle>
              <div className="flex items-center text-sm text-gray-500 mt-1 gap-1">
                <span>📅</span>
                {/* <span>{formatDateAndTime(payment.created_at, "dateTime")}</span> */}
              </div>
            </CardHeader>

            <CardContent className="space-y-3 text-sm text-gray-700">
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  Method: {payment.payment_method}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    statusStyles[payment.payment_status] ||
                    "bg-gray-100 text-gray-700"
                  }`}
                >
                  {payment.payment_status.toUpperCase()}
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <div>
                  <strong>Last Update: </strong>
                  {/* {formatDateAndTime(payment.updated_at, "dateTime")} */}
                </div>
              </div>

              <Button
                type="button"
                variant="destructive"
                onClick={(e) => handleRefundReq(e, payment.payment_id)}
              >
                {loadingId === payment.payment_id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Refund"
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyPayments;
