import { Box } from "@telegraph/layout";
import { GripVertical } from "lucide-react";
import React from "react";

/** How far the drag handle protrudes beyond the toolbar's right edge (px). */
export const DRAG_HANDLE_OVERHANG = 28;

type DragHandleProps = {
  onPointerDown: (e: React.PointerEvent) => void;
  isDragging: boolean;
};

export const DragHandle = ({ onPointerDown, isDragging }: DragHandleProps) => {
  return (
    <Box
      data-tgph-appearance="dark"
      onPointerDown={onPointerDown}
      style={{
        position: "absolute",
        top: "-4px",
        right: "-28px",
        width: "24px",
        height: "28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: isDragging ? "grabbing" : "grab",
        touchAction: "none",
        userSelect: "none",
        backgroundColor: "var(--tgph-surface-2)",
        border: "1px solid var(--tgph-border-1)",
        borderRadius: "0 6px 6px 0",
      }}
    >
      <GripVertical size={14} color="var(--tgph-text-2)" />
    </Box>
  );
};
