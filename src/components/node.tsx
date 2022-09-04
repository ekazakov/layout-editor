import React from "react";
import { observer } from "mobx-react-lite";
import { RoadNode, selectionManagerStore, cursorStore, nodeStore } from "../stores";
import { ContextMenu } from "../hooks/useContextMenu";

import styled from "@emotion/styled";

const InfoPanel = styled.div`
  border-radius: 5px;
  background-color: #fff;
  box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.6);
  padding: 20px;
  max-width: 200px;
  position: relative;

  table {
    background: none;
  }
`;

export const Node = observer(function Node({ node }: { node: RoadNode }) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [showInfo, setShowInfo] = React.useState(false);
  const selected = selectionManagerStore.isSelected(node.id);
  const isSingle = selectionManagerStore.selectedCount === 1;

  const menuItems = [
    { title: "Delete", action: () => nodeStore.deleteNode(node.id) },
    {
      title: "Info",
      action: () => {
        setShowInfo(true);
      },
    },
  ];

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
            // console.log("start dragging");
            setIsDragging(() => true);
            const element = evt.target as HTMLElement;

            element.setPointerCapture(evt.pointerId);
          }}
          onPointerUp={(evt) => {
            // console.log("end dragging");
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
        {selected && isSingle && <ContextMenu position={node.position} menuItems={menuItems} />}
        {showInfo && (
          <foreignObject x={node.position.x + 15} y={node.position.y - 15} width={300} height={200}>
            <InfoPanel>
              <code>
                <table>
                  <tbody>
                    <tr>
                      <td>id</td>
                      <td>{node.id}</td>
                    </tr>
                    <tr>
                      <td>segments</td>
                      <td>{node.segmentIds.size}</td>
                    </tr>
                    <tr>
                      <td>position</td>
                      <td>
                        {node.position.x},{node.position.y}
                      </td>
                    </tr>
                    <tr>
                      <td>gateId</td>
                      <td>{node.gateId}</td>
                    </tr>
                  </tbody>
                </table>
              </code>
            </InfoPanel>
          </foreignObject>
        )}
      </g>
    </>
  );
});
