import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function Overlay({ alertFlag, alertMessage, setAlertFlag, Title, customButton }) {
  return (
    <Dialog open={alertFlag} onOpenChange={setAlertFlag}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{Title || "Notice"}</DialogTitle>
          <DialogDescription asChild>
            <div>{alertMessage && alertMessage()}</div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {customButton || <Button variant="default" onClick={() => setAlertFlag(false)}>
            Close
          </Button>}

        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default Overlay;
