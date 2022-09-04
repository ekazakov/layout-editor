import React from "react";
import { observer } from "mobx-react-lite";
import { selectionManagerStore } from "../stores";
import { ContextMenu } from "./context-menu";

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
    const pos = { x: rect.right + 15, y: rect.top };
    const menuItems = [
      {
        title: "Only nodes",
        action: () => console.log("Only nodes"),
      },
      {
        title: "Only segments",
        action: () => console.log("Only segments"),
      },
      {
        title: "Only fixtures",
        action: () => console.log("Only fixtures"),
      },
    ];

    return (
      <>
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
