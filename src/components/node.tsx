import React from "react";
import { observer } from "mobx-react-lite";
import {
  RoadNode,
  selectionManagerStore,
  cursorStore,
  roadsStore,
  undoManagerStore,
} from "../stores";
import { ContextMenu } from "./context-menu";
import { InfoPanel } from "./info-panel";

export const Node = observer(function Node({ node }: { node: RoadNode }) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [showInfo, setShowInfo] = React.useState(false);
  const selected = selectionManagerStore.isSelected(node.id);
  const isSingle = selectionManagerStore.selectedCount === 1;

  const menuItems = [
    { title: "Delete", action: () => roadsStore.deleteSelection() },
    // TODO: add segment disjoin
    { title: "Disjoin", action: () => alert("not implemented yet") },
    {
      title: "Info",
      action: () => {
        setShowInfo(true);
      },
    },
  ];
  const infoItems = {
    id: node.id,
    segments: node.segmentIds.size,
    gateId: node.gateId || "—",
    position: `${node.position.x},${node.position.y}`,
  };

  const pos = {
    x: node.position.x + 15,
    y: node.position.y - 15,
  };

  return (
    <>
      <g>
        {/*  <text
          x={node.position.x + 15}
          y={node.position.y - 15}
          textAnchor="start"
          style={{ fontSize: 12, pointerEvents: "none" }}
        >
          #{node.id} ({node.segmentIds.size})
        </text>*/}

        <circle
          onPointerDown={(evt) => {
            setIsDragging(() => true);
            const element = evt.target as HTMLElement;

            undoManagerStore.stopTrackingChanges();
            element.setPointerCapture(evt.pointerId);
          }}
          onPointerUp={(evt) => {
            undoManagerStore.trackUp();
            setIsDragging(() => false);
            const element = evt.target as HTMLElement;
            element.releasePointerCapture(evt.pointerId);
            cursorStore.resetSnapping();
          }}
          onPointerMove={() => {
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
        {selected && isSingle && <ContextMenu position={pos} menuItems={menuItems} />}
        {showInfo && (
          <InfoPanel
            isOpen={showInfo}
            onClose={() => setShowInfo(false)}
            items={infoItems}
            position={pos}
          />
        )}
      </g>
    </>
  );
});
