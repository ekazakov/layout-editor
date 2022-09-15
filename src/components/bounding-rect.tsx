import React from "react";
import { observer } from "mobx-react-lite";
import { selectionManagerStore, undoManagerStore } from "../stores";
import { ContextMenu } from "./context-menu";

const style = {
  fill: "none",
  stroke: "blue",
  strokeWidth: 1,
};

export const BoundingRect = observer(function BoundingRect() {
  const [isDragging, setIsDragging] = React.useState(false);

  if (selectionManagerStore.isMulti) {
    const rect = selectionManagerStore.boundingRect;
    const pos = { x: rect.right + 15, y: rect.top };
    const menuItems = [
      {
        title: "Only nodes",
        action: () => selectionManagerStore.selectOnlyNodes(),
      },
      {
        title: "Only segments",
        action: () => selectionManagerStore.selectOnlySegments(),
      },
      {
        title: "Only fixtures",
        action: () => selectionManagerStore.selectOnlyFixtures(),
      },
    ];

    return (
      <>
        <rect
          onPointerDown={(evt) => {
            setIsDragging(() => true);
            const element = evt.target as HTMLElement;
            undoManagerStore.stopTrackingChanges();
            element.setPointerCapture(evt.pointerId);
          }}
          onPointerUp={(evt) => {
            setIsDragging(() => false);
            const element = evt.target as HTMLElement;
            undoManagerStore.updateUndoStack();
            element.releasePointerCapture(evt.pointerId);
          }}
          onPointerMove={(evt) => {
            if (isDragging) {
              const delta = {
                x: Math.round(evt.movementX),
                y: Math.round(evt.movementY),
              };
              selectionManagerStore.moveBy(delta);
            }
          }}
          data-type="bounding-rect"
          x={rect?.left}
          y={rect?.top}
          width={rect?.width}
          height={rect?.height}
          {...style}
          fill="#fff"
          fillOpacity="0"
        />
        <ContextMenu position={pos} menuItems={menuItems} />
      </>
    );
  }

  return null;
});
