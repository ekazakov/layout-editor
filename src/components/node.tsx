import React from "react";
import { observer } from "mobx-react-lite";
import { RoadNode, selectionStore, roadBuilder, globalSettingsStore } from "../stores";
import { ContextMenu } from "./context-menu";
import { InfoPanel } from "./info-panel";
import { useDndHandlers } from "../hooks/use-dnd-handlers";

export const Node = observer(function Node({ node }: { node: RoadNode }) {
  const [showInfo, setShowInfo] = React.useState(false);
  const selected = selectionStore.isSelected(node.id);
  const isSingle = selectionStore.selectedCount === 1;
  const dndProps = useDndHandlers();
  const menuItems = [
    { title: "Delete", action: () => roadBuilder.deleteSelection() },
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
        {globalSettingsStore.showNodesIds && (
          <text
            x={node.position.x + 15}
            y={node.position.y - 15}
            textAnchor="start"
            style={{ fontSize: 12, pointerEvents: "none" }}
          >
            #{node.id} ({node.segmentIds.size})
          </text>
        )}

        <circle
          {...dndProps}
          id={node.id}
          data-type="road-node"
          r={10}
          cx={node.position.x}
          cy={node.position.y}
          stroke={selected ? "orange" : "blue"}
          fill={"white"}
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
