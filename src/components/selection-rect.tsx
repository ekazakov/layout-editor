import React from "react";
import { observer } from "mobx-react-lite";
import { selectionStore, cursorStore } from "../stores/index";

const style = {
  fill: "none",
  stroke: "red",
  strokeWidth: 1
};

export const SelectionRect = observer(function SelectionRect() {
  const { start, end, selectionRect } = selectionStore;

  if (start && !end) {
    return (
      <path
        d={`M ${start.x} ${start.y} H ${cursorStore.x} V ${cursorStore.y} H ${start.x} Z`}
        {...style}
      />
    );
  }

  if (start && end) {
    console.log("selectionRect:", selectionRect);
    return (
      <rect
        data-type="selection-rect"
        x={selectionRect?.left}
        y={selectionRect?.top}
        width={selectionRect?.width}
        height={selectionRect?.height}
        {...style}
        fill="#fff"
        fillOpacity="0"
      />
    );
  }

  return null;
});
