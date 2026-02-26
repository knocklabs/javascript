import { Icon } from "@telegraph/icon";
import { Box } from "@telegraph/layout";
import { GripVertical } from "lucide-react";
import React from "react";

// How far the drag handle protrudes beyond the toolbar's right edge (px)
export const DRAG_HANDLE_OVERHANG = 16;

type DragHandleProps = {
  onPointerDown: (e: React.PointerEvent) => void;
  isDragging: boolean;
};

export const DragHandle = ({ onPointerDown, isDragging }: DragHandleProps) => {
  return (
    <Box
      data-tgph-appearance="dark"
      onPointerDown={onPointerDown}
      borderRadius="2"
      position="absolute"
      style={{
        top: "9px",
        right: `-${DRAG_HANDLE_OVERHANG}px`,
        height: "24px",
        cursor: isDragging ? "grabbing" : "grab",
        touchAction: "none",
        userSelect: "none",
      }}
    >
      <Icon color="gray" size="1" icon={GripVertical} aria-hidden />
    </Box>
  );
};
