import React from "react";
import { observer } from "mobx-react-lite";
import { selectionRectStore, cursorStore, selectionManagerStore } from "../stores";

const style = {
  fill: "none",
  stroke: "blue",
  strokeWidth: 1,
};

export const BoundingRect = observer(function BoundingRect() {
  const { selected } = selectionManagerStore;
  const [isDragging, setIsDragging] = React.useState(false);

  if (selected.type === "multi") {
    const { boundingRect: rect } = selected.value;
    // console.log("rect:", rect);
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
            const delta = {
              x: Math.round(evt.movementX),
              y: Math.round(evt.movementY),
            };
            selectionManagerStore.moveMultiSelection(delta);
          }
        }}
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
