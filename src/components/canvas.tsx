import React from "react";
import { observer } from "mobx-react-lite";
import { nodesStore, cursorStore } from "../stores/index";
import { RoadNode, RoadSegment } from "../stores/roads";
import { useHandleMouseDown } from "../hooks/useHandleMouseDown";
import { useShortcuts } from "../hooks/useShortcuts";
import { Segment, NewSegment } from "./segment";

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

export const Canvas = observer(function Canvas() {
  const nodes = [...nodesStore.nodes.values()];
  const segments = [...nodesStore.segments.values()];

  const { selectedNode } = nodesStore;

  const handlerMouseDown = useHandleMouseDown();
  useShortcuts();

  const onMouseMove = React.useCallback((evt: React.MouseEvent) => {
    cursorStore.setPostion({
      x: Math.round(evt.clientX),
      y: Math.round(evt.clientY)
    });
  }, []);

  return (
    <svg
      data-type="canvas"
      width="1000"
      height="1000"
      viewBox="0 0 1000 1000"
      onMouseDown={handlerMouseDown}
      onMouseMove={onMouseMove}
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
