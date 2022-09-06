import React from "react";
import { observer } from "mobx-react-lite";
import { selectionRectStore, cursorStore } from "../stores";

const style = {
  fill: "none",
  stroke: "red",
  strokeWidth: 1,
};

export const SelectionRect = observer(function SelectionRect() {
  const { start, end, rect } = selectionRectStore;
  if (start && !end) {
    return (
      <path
        d={`M ${start.x} ${start.y} H ${cursorStore.x} V ${cursorStore.y} H ${start.x} Z`}
        {...style}
      />
    );
  }

  if (start && end) {
    return (
      <rect
        data-type="selection-rect"
        x={rect?.left}
        y={rect?.top}
        width={rect?.width}
        height={rect?.height}
        {...style}
        fill="#fff"
        fillOpacity="0"
      />
    );
  }

  return null;
});
