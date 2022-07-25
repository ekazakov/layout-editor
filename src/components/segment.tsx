import React from "react";
import { observer } from "mobx-react-lite";
import { nodesStore, cursorStore } from "../stores/index";
import { RoadNode, RoadSegment } from "../stores/roads";
import { useHandleMouseDown } from "../hooks/useHandleMouseDown";
import { useShortcuts } from "../hooks/useShortcuts";

export const Node = observer(function Node({ node }: { node: RoadNode }) {
  const [isDragging, setIsDragging] = React.useState(false);

  return (
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
  );
});

export const NewSegment = observer(function NewSegment(props: any) {
  const { p1, p2 } = props;

  return (
    <line
      data-type="new-segment"
      style={{ pointerEvents: "none" }}
      x1={p1.x}
      y1={p1.y}
      x2={p2.x}
      y2={p2.y}
      strokeWidth={2}
      stroke="#333"
    />
  );
});

export const Segment = observer(function Segment(props: {
  segment: RoadSegment;
}) {
  const { segment } = props;

  return (
    <line
      id={segment.id}
      data-type="road-segment"
      x1={segment.start.x}
      y1={segment.start.y}
      x2={segment.end.x}
      y2={segment.end.y}
      strokeWidth={2}
      stroke="#333"
    />
  );
});
