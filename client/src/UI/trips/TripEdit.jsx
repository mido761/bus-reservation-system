import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

function toDateInputValue(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  // Ensure yyyy-mm-dd
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toTimeInputValue(timeLike) {
  if (!timeLike) return "";
  // Accept formats like HH:MM[:SS] or full ISO
  if (typeof timeLike === "string") {
    const isoMatch = timeLike.match(/T(\d{2}:\d{2})/);
    if (isoMatch) return isoMatch[1];
    const hhmm = timeLike.slice(0, 5);
    return hhmm;
  }
  const date = new Date(timeLike);
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

const TripEditDialog = ({ open, onOpenChange, trip, onUpdated }) => {
  const initial = useMemo(() => ({
    date: toDateInputValue(trip?.date),
    departureTime: toTimeInputValue(trip?.departure_time),
    arrivalTime: toTimeInputValue(trip?.arrival_time),
    price: trip?.price ?? "",
    min_cap: trip?.min_bus_cap ?? "",
  }), [trip]);

  const [formData, setFormData] = useState(initial);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setFormData(initial);
  }, [initial, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!trip?.trip_id) return;
    setSubmitting(true);
    try {
      await axios.put(`${backEndUrl}/trip/edit-trip`, {
        tripId: trip.trip_id,
        date: formData.date,
        departureTime: formData.departureTime,
        arrivalTime: formData.arrivalTime,
        price: formData.price,
        min_cap: formData.min_cap,
      });
      toast.success("Trip updated successfully!", { position: "top-center", autoClose: 2000 });
      onUpdated?.();
      onOpenChange(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error updating trip", { position: "top-center", autoClose: 2500 });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Trip</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departureTime">Departure Time</Label>
                <Input id="departureTime" name="departureTime" type="time" value={formData.departureTime} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="arrivalTime">Arrival Time</Label>
                <Input id="arrivalTime" name="arrivalTime" type="time" value={formData.arrivalTime} onChange={handleChange} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (EGP)</Label>
                <Input id="price" name="price" type="number" min="0" step="0.01" value={formData.price} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_cap">Min Bus Capacity</Label>
                <Input id="min_cap" name="min_cap" type="number" min="0" value={formData.min_cap} onChange={handleChange} />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TripEditDialog;


