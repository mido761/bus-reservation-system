import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

export default function PaymentStatus() {
  const location = useLocation();
  const navigate = useNavigate();

  const extractQueryParams = () => {
    const search =
      location.search ||
      (location.hash.includes("?")
        ? location.hash.substring(location.hash.indexOf("?"))
        : "") ||
      window.location.search ||
      "";
    return new URLSearchParams(search);
  };

  const query = extractQueryParams();

  // Helpers
  const readBool = (val) =>
    ["true", "1", "yes"].includes((val || "").toLowerCase());

  const approved = (val) => (val || "").toUpperCase() === "APPROVED";

  // ✅ Only accept clear "true" or "APPROVED"
  const isSuccess =
    readBool(query.get("success")) ||
    readBool(query.get("is_success")) ||
    approved(query.get("txn_response_code"));

  const orderId = query.get("id");

  useEffect(() => {
    if (!isSuccess) {
      console.warn("Payment failed or status not found");
    }
  }, [isSuccess]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <Card className="w-full max-w-md shadow-lg rounded-2xl">
        <CardHeader className="flex flex-col items-center text-center space-y-3">
          {isSuccess ? (
            <CheckCircle2 className="h-14 w-14 text-green-500" />
          ) : (
            <XCircle className="h-14 w-14 text-red-500" />
          )}
          <CardTitle className="text-2xl font-bold">
            {isSuccess ? "Payment Successful" : "Payment Failed"}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {isSuccess
              ? "Your transaction was completed successfully."
              : "Unfortunately, your payment was not successful."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex justify-between border-b pb-2 text-sm">
            <span className="font-medium text-gray-700">Order ID:</span>
            <span className="text-gray-900">{orderId || "N/A"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-700">Status:</span>
            <span
              className={`${
                isSuccess
                  ? "text-green-600 font-semibold"
                  : "text-red-600 font-semibold"
              }`}
            >
              {isSuccess ? "Success" : "Failure"}
            </span>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col items-center gap-3 p-6">
          <Button
            variant="default"
            className="w-full max-w-xs rounded-xl"
            onClick={() => navigate("/home")}
          >
            Return to Home
          </Button>

          <p className="text-sm font-bold text-gray-500 text-center">
            ✅ Your ticket has been sent. Check your email for details.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
