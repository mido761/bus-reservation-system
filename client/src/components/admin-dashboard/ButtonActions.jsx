import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";

const ButtonActions = ({ onEdit, onDelete, editLabel = "Edit", deleteLabel = "Delete", editDisabled = false, deleteDisabled = false }) => (
  <div className="flex gap-2">
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
);

export default ButtonActions;
