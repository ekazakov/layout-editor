import React from "react";
import { observer } from "mobx-react-lite";
import {
  roadsStore,
  cursorStore,
  nodeStore,
  segmentStore,
  fixtureStore,
  selectionRectStore,
} from "../stores";
import { useMouseEvents } from "../hooks/use-mouse-events";
import { useShortcuts } from "../hooks/use-shortcuts";
import { Segment, NewSegment } from "./segment";
import { Node } from "./node";
import { Fixture } from "./fixture";
import { SelectionRect } from "./selection-rect";
import { BoundingRect } from "./bounding-rect";

export const Canvas = observer(function Canvas() {
  const nodes = nodeStore.list;
  const segments = segmentStore.list;
  const fixtures = fixtureStore.list;

  const { selectedNode, selectedGate } = roadsStore;
  const { intersections, snapPoints } = segmentStore;

  const { onMouseDown, onMouseMove, onMouseUp, onMouseOver, onMouseOut, onClick } =
    useMouseEvents();
  useShortcuts();

  const selection = selectedNode || selectedGate;

  return (
    <svg
      data-type="canvas"
      width="2000"
      height="2000"
      viewBox="0 0 2000 2000"
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      onClick={onClick}
      style={{
        userSelect: selectionRectStore.inProgress ? "none" : "auto",
      }}
    >
      <g>
        {selection && cursorStore.metaKey && (
          <NewSegment
            p1={{ x: selection.position.x, y: selection.position.y }}
            p2={{
              x: cursorStore.snapPosition.x,
              y: cursorStore.snapPosition.y,
            }}
          />
        )}
      </g>
      <g>
        {fixtures.map((fixture) => {
          return <Fixture key={fixture.id} fixture={fixture} />;
        })}
      </g>
      <g>
        {segments.map((segment) => {
          return <Segment key={segment.id} segment={segment} />;
        })}
      </g>

      {cursorStore.metaKey && (
        <g>
          {intersections.map(({ segmentId, point }) => (
            <circle
              style={{ pointerEvents: "none" }}
              key={segmentId}
              r={10}
              cx={point.x}
              cy={point.y}
              stroke="blue"
              strokeWidth="2px"
              strokeDasharray="4"
              fill="white"
              opacity="0.8"
            />
          ))}
        </g>
      )}
      <g>
        {nodes.map((node) => {
          return <Node key={node.id} node={node} />;
        })}
      </g>
      {cursorStore.metaKey && snapPoints && (
        <g>
          {snapPoints.map(([point], index) => {
            return (
              <circle
                style={{ pointerEvents: "none" }}
                key={index}
                r={5}
                cx={point.x}
                cy={point.y}
                fill="red"
                opacity="0.4"
              />
            );
          })}
        </g>
      )}
      <SelectionRect />
      <BoundingRect />
    </svg>
  );
});
