import React from "react";
import { observer } from "mobx-react-lite";
import { nodesStore, cursorStore } from "../stores/index";
// import { RoadNode } from "../stores";
import { useMouseEvents } from "../hooks/useMouseEvents";
import { useShortcuts } from "../hooks/useShortcuts";
import { Segment, NewSegment } from "./segment";
import { Node } from "./node";

export const Canvas = observer(function Canvas() {
  const nodes = [...nodesStore.nodes.values()];
  const segments = [...nodesStore.segments.values()];

  const { selectedNode } = nodesStore;

  const {
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseOver,
    onMouseOut,
    onClick
  } = useMouseEvents();
  useShortcuts();

  return (
    <svg
      data-type="canvas"
      width="1000"
      height="1000"
      viewBox="0 0 1000 1000"
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      onClick={onClick}
    >
      <g>
        {selectedNode && (
          <NewSegment
            p1={{ x: selectedNode.position.x, y: selectedNode.position.y }}
            p2={{ x: cursorStore.position.x, y: cursorStore.position.y }}
          />
        )}
      </g>
      <g>
        {segments.map((segment) => {
          return <Segment key={segment.id} segment={segment} />;
        })}
      </g>
      <g>
        {nodes.map((node) => {
          return <Node key={node.id} node={node} />;
        })}
      </g>
    </svg>
  );
});
