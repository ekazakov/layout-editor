import React from "react";
import { observer } from "mobx-react-lite";
import { selectionRectStore, cursorStore, selectionManagerStore } from "../stores";

const style = {
  fill: "none",
  stroke: "red",
  strokeWidth: 1,
};

export const SelectionRect = observer(function SelectionRect() {
  const { start, end, rect } = selectionRectStore;
  // const [isDragging, setIsDragging] = React.useState(false);
  if (start && !end) {
    return (
      <path
        d={`M ${start.x} ${start.y} H ${cursorStore.x} V ${cursorStore.y} H ${start.x} Z`}
        {...style}
      />
    );
  }

  if (start && end) {
    // console.log("rect:", rect);
    return (
      <rect
        // onPointerDown={(evt) => {
        //   setIsDragging(() => true);
        //   const element = evt.target as HTMLElement;
        //
        //   element.setPointerCapture(evt.pointerId);
        // }}
        // onPointerUp={(evt) => {
        //   setIsDragging(() => false);
        //   const element = evt.target as HTMLElement;
        //   element.releasePointerCapture(evt.pointerId);
        // }}
        // onPointerMove={(evt) => {
        //   if (isDragging) {
        //     const delta = {
        //       x: Math.round(evt.movementX),
        //       y: Math.round(evt.movementY),
        //     };
        //     selectionRectStore.moveBy(delta);
        //     selectionManagerStore.moveMultiSelection(delta);
        //   }
        // }}
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
