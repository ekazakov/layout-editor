import React from "react";
import { observer } from "mobx-react-lite";
import { globalSettingsStore, RoadSegment, selectionStore } from "../stores";
import { useDndHandlers } from "../hooks/use-dnd-handlers";

export const NewSegment = function NewSegment(props: any) {
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
};

export const Segment = observer(function Segment(props: { segment: RoadSegment }) {
  const { segment } = props;
  const dndProps = useDndHandlers();
  const selected = selectionStore.isSelected(segment.id);

  return (
    <g>
      {globalSettingsStore.showSegmentsIds && (
        <text
          x={segment.middle.x + 15}
          y={segment.middle.y - 15}
          textAnchor="start"
          style={{ fontSize: 12, pointerEvents: "none", color: "red" }}
        >
          #{segment.id}
        </text>
      )}
      <line
        {...dndProps}
        id={segment.id}
        data-type="road-segment"
        x1={segment.start.x}
        y1={segment.start.y}
        x2={segment.end.x}
        y2={segment.end.y}
        strokeWidth={5}
        stroke={selected ? "orange" : "#777"}
      />
    </g>
  );
});
