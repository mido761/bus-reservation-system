import React, { useState, useEffect, useMemo } from "react";
import { Users, Search, User, Phone, Mail } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getStatusColor, formatDate } from "./utils";
import { Select } from "@/components/ui/select";


  const getUniqueStatuses = (arr, key) => {
    return Array.from(new Set(arr.map((item) => item[key]).filter(Boolean)));
  };

const PassengerList = ({ selectedTrip, passengers, tripStats, loading }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [bookingStatus, setBookingStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  // Memoize unique statuses for dropdowns
  const bookingStatusOptions = useMemo(
    () => getUniqueStatuses(passengers, "booking_status"),
    [passengers]
  );
  const paymentStatusOptions = useMemo(
    () => getUniqueStatuses(passengers, "payment_status"),
    [passengers]
  );

  // Filter passengers
  const filteredPassengers = useMemo(() => {
    return passengers.filter((p) => {
      const matchesSearch =
        !searchTerm.trim() ||
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone_number?.includes(searchTerm) ||
        p.email?.toLowerCase().includes(searchTerm);
      const matchesBooking = !bookingStatus || p.booking_status === bookingStatus;
      const matchesPayment = !paymentStatus || p.payment_status === paymentStatus;
      return matchesSearch && matchesBooking && matchesPayment;
    });
  }, [passengers, searchTerm, bookingStatus, paymentStatus]);

  // Calculate filtered stats
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Users className="w-6 h-6 text-blue-600" /> Passengers List
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {selectedTrip.source} → {selectedTrip.destination} • {formatDate(selectedTrip.date)}
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-2 items-center">
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
            <select
              value={bookingStatus}
              onChange={(e) => setBookingStatus(e.target.value)}
              className="border rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 w-full sm:w-40"
            >
              <option value="">All Booking Status</option>
              {bookingStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <select
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
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Passengers</p>
                <p className="text-2xl font-bold text-blue-900">{filteredStats.totalPassengers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Stop Counts */}
        {Object.keys(filteredStats.stopCounts).length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Passengers by Stop</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(filteredStats.stopCounts).map(([stop, count]) => (
                <div key={stop} className="bg-gray-50 border rounded-lg p-3 flex justify-between">
                  <p className="text-sm font-medium">{stop}</p>
                  <span className="text-lg font-bold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
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
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Passenger
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Stop
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Payment Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Booking Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Booked At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPassengers.map((p) => (
                  <tr key={p.user_id}>
                    <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{p.name || "N/A"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center mb-1">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {p.phone_number || "N/A"}
                        </div>
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {p.email || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{p.stop_name || "N/A"}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          p.payment_status,
                          "payment"
                        )}`}
                      >
                        {p.payment_status || "N/A"}
                      </span>
                    </td>
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
                      {p.booked_at ? new Date(p.booked_at).toLocaleString() : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PassengerList;
