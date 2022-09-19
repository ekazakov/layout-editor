import React from "react";
import { observer } from "mobx-react-lite";
import { selectionStore } from "../stores";
import { ContextMenu } from "./context-menu";
import { useDndHandlers } from "../hooks/use-dnd-handlers";

const style = {
  fill: "none",
  stroke: "blue",
  strokeWidth: 1,
};

export const BoundingRect = observer(function BoundingRect() {
  const dndProps = useDndHandlers();

  if (selectionStore.isMulti) {
    const rect = selectionStore.boundingRect;
    const pos = { x: rect.right + 15, y: rect.top };
    const menuItems = [
      {
        title: "Only nodes",
        action: () => selectionStore.selectOnlyNodes(),
      },
      {
        title: "Only segments",
        action: () => selectionStore.selectOnlySegments(),
      },
      {
        title: "Only fixtures",
        action: () => selectionStore.selectOnlyFixtures(),
      },
    ];

    return (
      <>
        <rect
          {...dndProps}
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
