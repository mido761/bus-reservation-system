import React, { useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ToastContainer, toast } from "react-toastify";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

function isEmptyObject(obj) {
  return (
    obj &&
    typeof obj === "object" &&
    !Array.isArray(obj) &&
    Object.keys(obj).length === 0
  );
}

export default function Operator() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Search handler
  const handleSearch = async () => {
    console.log("Trxn ID: ", search);
    if (!search.trim()) return;
    setIsLoading(true);
    setSearched(true);
    try {
      const { data } = await axios.get(`${backEndUrl}/payment/by-trx`, {
        params: { transactionId: search },
      });
      setResults(data.user_payment);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error fetching bookings");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Confirm payment
  const handleConfirm = async (bookingId) => {
    setIsLoading(true);
    try {
      await axios.post(`${backEndUrl}/payment/confirm-VF-payment`, {
        bookingId,
      });
      setResults((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: "payed" } : b))
      );
      toast.success("Payment Confirmed successfully");
    } catch (err) {
      console.error(
        "Payment confirm Error: ",
        err?.response?.data?.message || "Error confirming payment"
      );
      toast.error(err?.response?.data?.message || "Error confirming payment");
    } finally {
      setIsLoading(false);
    }
  };

  // Reject payment
  const handleReject = async (bookingId) => {
    setIsLoading(true);
    try {
      await axios.post(`${backEndUrl}/payment/reject-VF-payment`, {
        bookingId,
      });
      setResults((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: "pending" } : b))
      );
      toast.success("Payment Rejected");
    } catch (err) {
      console.error(
        "Payment confirm Error: ",
        err?.response?.data?.message || "Error rejecting payment"
      );
      toast.error(err?.response?.data?.message || "Error rejecting payment");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      <Card className="border border-gray-200 flex flex-col items-center">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold flex items-center gap-2">
            👨‍💻 Operator Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <Input
              placeholder="Search by Booking ID, Transaction ID, or Sender Phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full md:w-96"
              disabled={isLoading}
            />
            <Button
              onClick={handleSearch}
              disabled={isLoading || !search.trim()}
              className="w-full md:w-auto"
            >
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold flex items-center gap-2">
            📝 Booking Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!searched ? (
            <div className="text-gray-400 text-center py-8">
              Enter a search to view bookings.
            </div>
          ) : isEmptyObject(results) ? (
            <div className="text-gray-500 text-center py-8">
              No results found.
            </div>
          ) : (
            <Table className="mt-2">
              <TableHeader>
                <TableRow>
                  <TableHead>Name: </TableHead>
                  <TableHead>Trans. ID</TableHead>
                  <TableHead>Sender Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((row) => (
                  <TableRow key={row.booking_id}>
                    <TableCell>{row.passenger_name}</TableCell>
                    <TableCell>{row.transaction_id || "-"}</TableCell>
                    <TableCell>{row.sender_number || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          row.payment_status === "paid"
                            ? "success"
                            : "secondary"
                        }
                      >
                        {row.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {["pending", "rejected"].includes(
                          row.payment_status
                        ) && (
                          <Button
                            size="sm"
                            variant="default"
                            disabled={
                              row.payment_status === "paid" || isLoading
                            }
                            onClick={() => handleConfirm(row.booking_id)}
                          >
                            Confirm
                          </Button>
                        )}
                        {["pending", "confirmed"].includes(
                          row.payment_status
                        ) && (
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={
                              row.payment_status === "paid" || isLoading
                            }
                            onClick={() => handleReject(row.booking_id)}
                          >
                            Reject
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
