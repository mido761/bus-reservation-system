import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import LoadingScreen from "../../loadingScreen/loadingScreen";
import Overlay from "../../overlayScreen/overlay";
import ButtonActions from "../ButtonActions";
import StopEditDialog from "../../../UI/stops/stopEdit";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const Stops = () => {
  const [stops, setStops] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingStop, setEditingStop] = useState(null);

  const [newStop, setNewStop] = useState({
    stopName: "",
    location: "",
  });

  // Fetch stops
  const fetchStops = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${backEndUrl}/stop/get-stops`);
      setStops(data);

      if (data.length === 0) {
        toast.info("No stops available yet.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error fetching stops!");
    } finally {
      setIsLoading(false);
    }
  };

  // Add stop
  const addStop = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await axios.post(`${backEndUrl}/stop/add-stop`, newStop);
      toast.success("Stop added successfully!");
      setNewStop({ stopName: "", location: "" });
      fetchStops();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error adding stop!");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete stop
  const handleDel = async (e, stopId) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log(stopId)
      await axios.put(`${backEndUrl}/stop/del-stop`, { stopId });

      toast.success("Stop deleted successfully", {
        position: "top-center",
        autoClose: 2000,
      });

      fetchStops();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error deleting stop!", {
        position: "top-center",
        autoClose: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };


  const openEditDialog = (e, stop) => {
    console.log(stop)
    e.stopPropagation();
    setEditingStop(stop);
    setEditOpen(true);
  };

  // Edit stop
  const handleEdit = async (e, stopId) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log(stopId)
      await axios.put(`${backEndUrl}/stop/edit-stop/${stopId}`, { stopName, location, distanceFromSource });

      toast.success("Stop deleted successfully!", {
        position: "top-center",
        autoClose: 2000,
      });

      fetchStops();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error deleting stop!", {
        position: "top-center",
        autoClose: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    fetchStops();
  }, []);

  return (
    <>
      {/* Toast container */}
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={true}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />

      {/* Add Stop Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold flex items-center gap-2">
            ➕ Add New Stop
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addStop}>
            <div>
              <label className="block text-sm font-medium mb-1">
                Stop Name
              </label>
              <Input
                type="text"
                placeholder="Enter stop name"
                value={newStop.stopName}
                onChange={(e) =>
                  setNewStop({ ...newStop, stopName: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <Input
                type="text"
                placeholder="Enter location"
                value={newStop.location}
                onChange={(e) =>
                  setNewStop({ ...newStop, location: e.target.value })
                }
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Add Stop
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Stops List */}
      <Card c>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Stops List</CardTitle>
        </CardHeader>
        <CardContent>
          {stops.length === 0 ? (
            <p className="text-sm text-gray-500">No stops available.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {stops.map((stop) => (
                <li key={stop.stop_id} className="py-2 flex justify-between items-center">
                  <span>
                    <span className="font-medium">{stop.stop_name}</span>
                    <span className="text-gray-600"> — {stop.location}</span>
                  </span>
                  <ButtonActions
                    onEdit={(e) => openEditDialog(e, stop)}
                    onDelete={(e) => handleDel(e, stop.stop_id)}
                    editLabel={"Edit"}
                    deleteLabel={"Delete"}
                  />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {isLoading && <LoadingScreen />}
      <Overlay />

      {/* Edit Trip Dialog */}
      <StopEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        stop={editingStop}
        onUpdated={fetchStops}
      />
    </>
  );
};

export default Stops;
