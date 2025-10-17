import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash, Check, XCircle } from "lucide-react";

const ButtonActions = ({ onEdit, onDelete, onComplete, onCancel, editLabel = "Edit", deleteLabel = "Delete", completeLabel = "Complete", cancelLabel = "Cancel", editDisabled = false, deleteDisabled = false, completeDisabled = false, cancelDisabled = false, showComplete = false, showCancel = false }) => (
  <div className="flex flex-col gap-2">
    <div className="flex gap-2">
      <p> {showCancel} {showComplete}</p>
      <Button
        variant="outline"
        onClick={onEdit}
        size="sm"
        disabled={editDisabled}
        className="flex items-center gap-1"
        title={editLabel}
      >
        <Pencil className="w-4 h-4" /> <span className="hidden sm:inline">{editLabel}</span>
      </Button>
      <Button
        variant="destructive"
        onClick={onDelete}
        size="sm"
        disabled={deleteDisabled}
        className="flex items-center gap-1"
        title={deleteLabel}
      >
        <Trash className="w-4 h-4" /> <span className="hidden sm:inline">{deleteLabel}</span>
      </Button>
    </div>
    {(
      <>
        {showComplete && (<Button
          variant="default"
          onClick={onComplete}
          size="sm"
          disabled={completeDisabled}
          className="flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-700"
          title={completeLabel}
        >
          <Check className="w-4 h-4" /> <span className="hidden sm:inline">{completeLabel}</span>
        </Button>)}
        {showCancel && (<Button
          variant="default"
          onClick={onCancel}
          size="sm"
          disabled={cancelDisabled}
          className="flex items-center gap-1 bg-amber-600 text-white hover:bg-amber-700"
          title={cancelLabel}
        >
          <XCircle className="w-4 h-4" /> <span className="hidden sm:inline">{cancelLabel}</span>
        </Button>)}


      </>
    )}
  </div>
);

export default ButtonActions;
