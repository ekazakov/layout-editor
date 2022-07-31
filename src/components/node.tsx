import React from "react";
import { observer } from "mobx-react-lite";
import { RoadNode } from "../stores";

export const Node = observer(function Node({ node }: { node: RoadNode }) {
  const [isDragging, setIsDragging] = React.useState(false);

  return (
    <g>
      <text
        x={node.position.x + 15}
        y={node.position.y - 15}
        textAnchor="start"
        style={{ fontSize: 12, pointerEvents: "none" }}
      >
        s: {node.segmentIds.size}
      </text>
      <circle
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
            node.setPostion({
              x: Math.round(evt.clientX),
              y: Math.round(evt.clientY)
            });
          }
        }}
        id={node.id}
        data-type="road-node"
        r={10}
        cx={node.position.x}
        cy={node.position.y}
        stroke={node.selected ? "orange" : "blue"}
        fill={isDragging ? "orange" : "white"}
        strokeWidth="2px"
      />
    </g>
  );
});
