import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

export function PendingModal({
  showPendingModal,
  handleConfirm,
  handleCancel,
}) {
  console.log(showPendingModal);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <Card className="max-w-xs w-full p-4 text-center">
        <CardHeader>
          <CardTitle className="text-lg text-destructive text-center">
            Pending Booking Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-2 mb-4">
            <span role="img" aria-label="stop">
              🚌
            </span>
            <span className="font-semibold">
              {showPendingModal?.booking?.stop_name}
            </span>
            <span className="text-muted-foreground">
              {showPendingModal?.booking?.location}
            </span>
          </div>
          <div className="flex justify-center gap-2">
            <Button variant="default" onClick={handleConfirm}>
              Complete Reservation
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
