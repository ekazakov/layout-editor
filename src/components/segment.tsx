import React from "react";
import { observer } from "mobx-react-lite";
import { RoadSegment } from "../stores";

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
  const [isDragging, setIsDragging] = React.useState(false);

  return (
    <line
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
          segment.moveBy({
            x: Math.round(evt.movementX),
            y: Math.round(evt.movementY)
          });
        }
      }}
      id={segment.id}
      data-type="road-segment"
      x1={segment.start.x}
      y1={segment.start.y}
      x2={segment.end.x}
      y2={segment.end.y}
      strokeWidth={5}
      stroke={segment.selected ? "orange" : "#777"}
    />
  );
});
