import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const StopEditDialog = ({ open, onOpenChange, stop, onUpdated }) => {
  const initial = useMemo(() => ({
    stopName: stop?.stop_name || "",
    location: stop?.location || "",
    distanceFromSource: stop?.distance_from_source ?? "",
  }), [stop]);

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
    if (!stop?.stop_id) return;
    setSubmitting(true);
    try {
      await axios.put(`${backEndUrl}/stop/edit-stop/${stop.stop_id}`, {
        stopName: formData.stopName,
        location: formData.location,
        distanceFromSource: formData.distanceFromSource,
      });
      toast.success("Stop updated successfully!", { position: "top-center", autoClose: 2000 });
      onUpdated?.();
      onOpenChange(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error updating stop!", { position: "top-center", autoClose: 2500 });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit stop</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="Name">Name</Label>
              <Input id="Name" name="stopName" type="text" value={formData?.stopName} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="Location">Location</Label>
              <Input id="Location" name="location" type="text" value={formData?.location} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="DFM">Distance from source</Label>
              <Input id="DFM" name="distanceFromSource" type="number" value={formData?.distanceFromSource ?? ""} onChange={handleChange} required />
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

export default StopEditDialog;


