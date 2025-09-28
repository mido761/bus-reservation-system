import React, { useState, useEffect } from 'react';
import { Search, Users, Calendar, Clock, MapPin, CreditCard, Phone, Mail, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const PassengersList = () => {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [filteredPassengers, setFilteredPassengers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tripStats, setTripStats] = useState({
    totalPassengers: 0,
    stopCounts: {}
  });

  // Fetch all trips on component mount
  useEffect(() => {
    fetchTrips();
  }, []);

  // Filter passengers based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPassengers(passengers);
    } else {
      const filtered = passengers.filter(passenger => 
        passenger.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        passenger.phone_number?.toString().includes(searchTerm) ||
        passenger.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        passenger.seat_number?.toString().includes(searchTerm)
      );
      setFilteredPassengers(filtered);
    }
  }, [searchTerm, passengers]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backEndUrl}/booking/get-trips-with-counts`);
      if (!response.ok) throw new Error('Failed to fetch trips');
      const data = await response.json();
      setTrips(data);
    } catch (err) {
      setError('Failed to load trips');
      console.error('Error fetching trips:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPassengers = async (tripId) => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${backEndUrl}/booking/get-trip-passengers/${tripId}`);
      if (!response.ok) throw new Error('Failed to fetch passengers');
      const data = await response.json();
      setPassengers(data.passengers || []);
      setFilteredPassengers(data.passengers || []);
      setTripStats({
        totalPassengers: data.totalPassengers || 0,
        stopCounts: data.stopCounts || {}
      });
    } catch (err) {
      setError('Failed to load passengers');
      console.error('Error fetching passengers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTripSelect = (trip) => {
    setSelectedTrip(trip);
    setSearchTerm('');
    fetchPassengers(trip.trip_id);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'successful':
      case 'sucsseful':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBookingStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && trips.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
       
        {/* Trips Selection */}
        <Card className="shadow-lg border border-gray-200">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              Select Trip
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip) => (
                <Card 
                  key={trip.trip_id}
                  className={`shadow-md border transition-all duration-200 hover:shadow-lg cursor-pointer ${
                    selectedTrip?.trip_id === trip.trip_id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleTripSelect(trip)}
                >
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {trip.source} → {trip.destination}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        trip.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {trip.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span>{formatDate(trip.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span>{formatTime(trip.departure_time)} - {formatTime(trip.arrival_time)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span>{trip.distance} km • {trip.estimated_duration} min</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-blue-600">
                          ${trip.price}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Users className="w-3 h-3" />
                          <span>{trip.total_passengers || 0} passengers</span>
                        </div>
                      </div>
                      <Button 
                        variant={selectedTrip?.trip_id === trip.trip_id ? "default" : "outline"}
                        size="sm"
                        className="text-xs"
                      >
                        {selectedTrip?.trip_id === trip.trip_id ? 'Selected' : 'Select Trip'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Passengers List */}
        {selectedTrip && (
          <Card className="shadow-lg border border-gray-200">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl font-semibold flex items-center gap-2">
                    <Users className="w-6 h-6 text-blue-600" />
                    Passengers List
                  </CardTitle>
                  <p className="text-gray-600 mt-2">
                    {selectedTrip.source} → {selectedTrip.destination} • {formatDate(selectedTrip.date)}
                  </p>
                </div>
                
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search passengers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                  />
                </div>
              </div>
              
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {/* Total Passengers */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Passengers</p>
                      <p className="text-2xl font-bold text-blue-900">{tripStats.totalPassengers}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                
                {/* Trip Duration */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Trip Duration</p>
                      <p className="text-2xl font-bold text-green-900">{selectedTrip.estimated_duration || 'N/A'} min</p>
                    </div>
                    <Clock className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                
                {/* Distance */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Distance</p>
                      <p className="text-2xl font-bold text-purple-900">{selectedTrip.distance || 'N/A'} km</p>
                    </div>
                    <MapPin className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
              </div>
              
              {/* Stop Counters */}
              {Object.keys(tripStats.stopCounts).length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Passengers by Stop</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {Object.entries(tripStats.stopCounts).map(([stopName, count]) => (
                      <div key={stopName} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-700 truncate" title={stopName}>
                              {stopName}
                            </p>
                            <p className="text-lg font-bold text-gray-900">{count}</p>
                          </div>
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-gray-600">{count}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredPassengers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchTerm ? 'No passengers found matching your search.' : 'No passengers found for this trip.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Passenger
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Seat
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Booking Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Booked At
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPassengers.map((passenger) => (
                        <tr key={passenger.booking_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <User className="w-5 h-5 text-blue-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {passenger.name || 'N/A'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {passenger.user_id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <div className="flex items-center mb-1">
                                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                {passenger.phone_number || 'N/A'}
                              </div>
                              <div className="flex items-center">
                                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                {passenger.email || 'N/A'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {passenger.seat_number || 'N/A'}
                            </div>
                            {passenger.stop_name && (
                              <div className="text-xs text-gray-500">
                                Stop: {passenger.stop_name}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(passenger.payment_status)}`}>
                              {passenger.payment_status || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBookingStatusColor(passenger.booking_status)}`}>
                              {passenger.booking_status || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <CreditCard className="w-4 h-4 mr-1 text-gray-400" />
                              <span className="text-sm text-gray-900">
                                ${passenger.amount || '0.00'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {passenger.booked_at ? new Date(passenger.booked_at).toLocaleString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PassengersList;
