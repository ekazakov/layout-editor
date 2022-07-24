import React from "react";
import { observer } from "mobx-react-lite";
import { runInAction } from "mobx";
import { nodesStore, cursorStore } from "./stores/index";
import { RoadNode, RoadSegment } from "./stores/roads";

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

const NewSegment = observer(function NewSegment(props: any) {
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

const Segment = observer(function Segment(props: { segment: RoadSegment }) {
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

export const Canvas = observer(function Canvas() {
  const nodes = [...nodesStore.nodes.values()];
  const segments = [...nodesStore.segments.values()];

  const { selectedNode } = nodesStore;

  const onMouseDown = React.useCallback(
    (evt: React.MouseEvent) => {
      // console.log("target:", evt.target);
      const element = evt.target as HTMLElement;
      const {
        dataset: { type = "none" }
      } = element;
      // console.log(evt.target.dataset);
      switch (type) {
        case "canvas":
          runInAction(() => {
            const newNode = nodesStore.addNode({
              x: evt.clientX,
              y: evt.clientY
            });
            // console.log("newNode:", newNode.id, "selected:", selectedNode?.id);
            if (selectedNode) {
              nodesStore.addSegment(selectedNode.id, newNode.id);
              nodesStore.toggleNodeSelection(newNode.id);
            }
          });
          break;
        case "road-node": {
          nodesStore.toggleNodeSelection(element.id);
          break;
        }

        default:
          console.error("Unknow type:", type);
      }
    },
    [selectedNode]
  );

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
      onMouseDown={onMouseDown}
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
