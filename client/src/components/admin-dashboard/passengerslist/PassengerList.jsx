import React, { useState, useMemo } from "react";
import { Users, Search, User, Phone, Mail } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getStatusColor, formatDate } from "./utils";

const getUniqueStatuses = (arr, key) =>
  Array.from(new Set(arr.map((item) => item[key]).filter(Boolean)));

const PassengerList = ({
  selectedTrip,
  passengers,
  tripStats,
  loading,
  driverMode = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [bookingStatus, setBookingStatus] = useState("confirmed_waiting");
  const [paymentStatus, setPaymentStatus] = useState("");

  // Generate dropdown options for booking & payment statuses
  const bookingStatusOptions = useMemo(() => {
    const statuses = getUniqueStatuses(passengers, "booking_status");
    const exclude = ["confirmed", "waiting", "pending", "cancelled", "rejected"];
    const others = statuses.filter((s) => !exclude.includes(s));

    return [
      { value: "", label: "All Status" },
      {
        value: "confirmed_waiting",
        label: "Confirmed & Waiting",
        show:
          statuses.includes("confirmed") || statuses.includes("waiting"),
      },
      {
        value: "pending",
        label: "Pending",
        show: statuses.includes("pending"),
      },
      {
        value: "cancelled_rejected",
        label: "Cancelled & Rejected",
        show:
          statuses.includes("cancelled") || statuses.includes("rejected"),
      },
      ...others.map((s) => ({
        value: s,
        label: s.charAt(0).toUpperCase() + s.slice(1),
        show: true,
      })),
    ].filter((opt) => opt.show !== false);
  }, [passengers]);

  const paymentStatusOptions = useMemo(
    () => getUniqueStatuses(passengers, "payment_status"),
    [passengers]
  );

  // Apply filtering & sorting
  const filteredPassengers = useMemo(() => {
    return passengers
      .filter((p) => {
        // hide cancelled/rejected in driver mode
        if (driverMode && ["cancelled", "rejected"].includes((p.booking_status || "").toLowerCase())) return false;
        const matchesSearch =
          !searchTerm.trim() ||
          p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.phone_number?.includes(searchTerm) ||
          p.email?.toLowerCase().includes(searchTerm);

        let matchesBooking = true;
        if (bookingStatus === "confirmed_waiting") {
          matchesBooking = ["confirmed", "waiting"].includes(p.booking_status);
        } else if (bookingStatus === "pending") {
          matchesBooking = p.booking_status === "pending";
        } else if (bookingStatus === "cancelled_rejected") {
          matchesBooking = ["cancelled", "rejected"].includes(p.booking_status);
        } else if (bookingStatus) {
          matchesBooking = p.booking_status === bookingStatus;
        }

        const matchesPayment =
          !paymentStatus || p.payment_status === paymentStatus;

        return matchesSearch && matchesBooking && matchesPayment;
      })
      .sort((a, b) => {
        const dateA = a.booked_at ? new Date(a.booked_at).getTime() : 0;
        const dateB = b.booked_at ? new Date(b.booked_at).getTime() : 0;
        return dateA - dateB;
      });
  }, [passengers, searchTerm, bookingStatus, paymentStatus]);

  // Calculate summary stats
  const filteredStats = useMemo(() => {
    const stopCounts = {};
    filteredPassengers.forEach((p) => {
      const stop = p.stop_name;
      stopCounts[stop] = (stopCounts[stop] || 0) + 1;
    });
    return {
      totalPassengers: filteredPassengers.length,
      stopCounts,
    };
  }, [filteredPassengers]);

  return (
    <Card>
      <CardHeader>
        {/* Header + Search + Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Users className="w-6 h-6 text-blue-600" />
              Passengers List
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {selectedTrip.source} → {selectedTrip.destination} •{" "}
              {formatDate(selectedTrip.date)}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 items-center">


            {/* Filters (hide in driver mode) */}
            {!driverMode && (
              <>
                <select
                  value={bookingStatus}
                  onChange={(e) => setBookingStatus(e.target.value)}
                  className="border rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 w-full sm:w-40"
                >
                  {bookingStatusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                {/* <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="border rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 w-full sm:w-40"
                >
                  <option value="">All Payment Status</option>
                  {paymentStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select> */}
              </>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">
                  Total Passengers
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {filteredStats.totalPassengers}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Passengers by Stop */}
        {Object.keys(filteredStats.stopCounts).length > 0 && (
          <div className="mt-6">
            {/* <h3 className="text-lg font-semibold mb-3">
              Passengers by Stop
            </h3> */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(filteredStats.stopCounts).map(([stop, count]) => (
                <div
                  key={stop}
                  className="bg-gray-50 border rounded-lg p-3 flex justify-between"
                >
                  <p className="text-sm font-medium">{stop}</p>
                  <span className="text-lg font-bold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* Search box */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search passengers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full sm:w-48"
          />
        </div>
        
        {/* Loading / Empty / Data States */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredPassengers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm || bookingStatus || paymentStatus
                ? "No passengers found matching your filters."
                : "No passengers found for this trip."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* DRIVER MODE TABLE */}
            {driverMode ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {["Passenger", "Contact", "Stop", "Route"].map((header) => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPassengers.map((p, idx) => {
                    const total = filteredPassengers.length;
                    const fullBlocks = Math.floor(total / 15); // number of completely filled 15-passenger blocks
                    const blockIndex = Math.floor(idx / 15);
                    // Mark block green only if the block index is strictly less than fullBlocks
                    const isGreenBlock = blockIndex < fullBlocks;
                    const rowBg = isGreenBlock ? "bg-green-100" : "bg-red-100";
                    const textColor = isGreenBlock ? "text-green-900" : "text-red-900";

                    return (
                      <tr key={p.user_id} className={rowBg}>
                        <td className={`px-6 py-4 flex items-center gap-3 ${textColor}`}>
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <p className="text-sm font-medium">{p.name || "N/A"}</p>
                        </td>
                        <td className={`px-6 py-4 ${textColor}`}>
                          <div className="text-sm">
                            <div className="flex items-center mb-1">
                              <Phone className="w-4 h-4 mr-2 text-gray-400" />
                              {p.phone_number || "N/A"}
                            </div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 ${textColor}`}>
                          {p.stop_name || "N/A"}
                        </td>
                        <td className={`px-6 py-4 text-sm ${textColor}`}>
                          {(p.source || p.route_source || "") +
                            (p.destination || p.route_destination
                              ? ` → ${p.destination || p.route_destination}`
                              : "")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              /* ADMIN MODE TABLE */
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  {[
                    "Passenger",
                    "Contact",
                    "Stop",
                    "Booking Status",
                    "Booked At",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      {header}
                    </th>
                  ))}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPassengers.map((p) => (
                    <tr key={p.user_id}>
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {p.name || "N/A"}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center mb-1">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {p.phone_number || "N/A"}
                        </div>
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {p.email || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">{p.stop_name || "N/A"}</td>
                      {/* <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            p.payment_status,
                            "payment"
                          )}`}
                        >
                          {p.payment_status || "N/A"}
                        </span>
                      </td> */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            p.booking_status,
                            "booking"
                          )}`}
                        >
                          {p.booking_status || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {p.booked_at
                          ? new Date(p.booked_at).toLocaleString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PassengerList;
