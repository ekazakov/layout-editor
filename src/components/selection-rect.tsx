import React from "react";
import { observer } from "mobx-react-lite";
import { selectionStore, cursorStore, roadsStore } from "../stores/index";

const style = {
  fill: "none",
  stroke: "red",
  strokeWidth: 1,
};

export const SelectionRect = observer(function SelectionRect() {
  const { start, end, selectionRect } = selectionStore;
  const [isDragging, setIsDragging] = React.useState(false);
  if (start && !end) {
    return (
      <path
        d={`M ${start.x} ${start.y} H ${cursorStore.x} V ${cursorStore.y} H ${start.x} Z`}
        {...style}
      />
    );
  }

  if (start && end) {
    // console.log("selectionRect:", selectionRect);
    return (
      <rect
        onPointerDown={(evt) => {
          setIsDragging(() => true);
          const element = evt.target as HTMLElement;

          element.setPointerCapture(evt.pointerId);
        }}
        onPointerUp={(evt) => {
          setIsDragging(() => false);
          const element = evt.target as HTMLElement;
          element.releasePointerCapture(evt.pointerId);
        }}
        onPointerMove={(evt) => {
          if (isDragging) {
            roadsStore.moveSelection({
              x: Math.round(evt.movementX),
              y: Math.round(evt.movementY),
            });
          }
        }}
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
