import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

import LoadingScreen from "../../loadingScreen/loadingScreen";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const Bus = () => {
  const [buses, setBuses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newBus, setNewBus] = useState({
    plateNumber: "",
    capacity: "",
  });

  // Fetch all buses
  const fetchBuses = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${backEndUrl}/bus/get-available-buses`);
      setBuses(data.buses || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error fetching buses!");
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new bus
  const addBus = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await axios.post(`${backEndUrl}/bus/add-bus`, newBus);
      toast.success("✅ Bus added successfully!");
      setNewBus({ plateNumber: "", capacity: "" });
      fetchBuses();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error adding bus!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  return (
    <>
      {/* Add Bus Form */}
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold flex items-center gap-2">
            ➕ Add New Bus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addBus} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Bus Number
              </label>
              <Input
                type="text"
                placeholder="Enter bus number"
                value={newBus.plateNumber}
                onChange={(e) =>
                  setNewBus({ ...newBus, plateNumber: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Capacity</label>
              <Input
                type="number"
                placeholder="Enter capacity"
                value={newBus.capacity}
                onChange={(e) =>
                  setNewBus({ ...newBus, capacity: e.target.value })
                }
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Add Bus
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Bus List */}
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">🚌 Bus List</CardTitle>
        </CardHeader>
        <CardContent>
          {buses.length === 0 ? (
            <p className="text-gray-500">No buses available.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {buses.map((bus) => (
                <li
                  key={bus.bus_id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="font-medium">
                    {bus.plate_number} — {bus.capacity} seats
                  </div>
                  <div className="flex items-center gap-4">
                    {bus.qr_code && (
                      <img
                        src={bus.qr_code}
                        alt="Bus QR Code"
                        className="w-16 h-16 object-contain rounded"
                      />
                    )}
                    {bus.check_in_link && (
                      <a
                        href={bus.check_in_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Check In Link
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {isLoading && <LoadingScreen />}
    </>
  );
};

export default Bus;
