import React from "react";
import { observer } from "mobx-react-lite";
import { RoadNode, selectionManagerStore, cursorStore } from "../stores";

export const Node = observer(function Node({ node }: { node: RoadNode }) {
  const [isDragging, setIsDragging] = React.useState(false);
  const selected = selectionManagerStore.isSelected(node.id);

  return (
    <g>
      <text
        x={node.position.x + 15}
        y={node.position.y - 15}
        textAnchor="start"
        style={{ fontSize: 12, pointerEvents: "none" }}
      >
        #{node.id} ({node.segmentIds.size})
      </text>
      <circle
        onPointerDown={(evt) => {
          // console.log("start dragging");
          setIsDragging(() => true);
          const element = evt.target as HTMLElement;

          element.setPointerCapture(evt.pointerId);
        }}
        onPointerUp={(evt) => {
          // console.log("end dragging");
          setIsDragging(() => false);
          const element = evt.target as HTMLElement;
          element.releasePointerCapture(evt.pointerId);
          cursorStore.resetSnapping();
        }}
        onPointerMove={(evt) => {
          if (isDragging) {
            node.setPosition(cursorStore.snapPosition);
          }
        }}
        id={node.id}
        data-type="road-node"
        r={10}
        cx={node.position.x}
        cy={node.position.y}
        stroke={selected ? "orange" : "blue"}
        fill={isDragging ? "orange" : "white"}
        strokeWidth="2px"
      />
    </g>
  );
});
