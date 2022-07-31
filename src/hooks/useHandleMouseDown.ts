import React from "react";
import { runInAction } from "mobx";
import { nodesStore, cursorStore } from "../stores";
// import { RoadNode, RoadSegment } from "../stores";

export function useHandleMouseDown() {
  const { selectedNode } = nodesStore;

  return React.useCallback(
    (evt: React.MouseEvent) => {
      // console.log("target:", evt.target);
      const { altKey } = evt;
      const element = evt.target as HTMLElement;
      const {
        dataset: { type = "none" }
      } = element;

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
          if (selectedNode) {
            if (!nodesStore.isConnected(selectedNode.id, element.id)) {
              nodesStore.addSegment(selectedNode.id, element.id);
            }
          }
          nodesStore.toggleNodeSelection(element.id);
          break;
        }
        case "road-segment": {
          if (altKey) {
            nodesStore.splitSegmentAt(element.id, {
              x: evt.clientX,
              y: evt.clientY
            });
          } else {
            nodesStore.toggleSegmentSelection(element.id);
          }
          break;
        }

        default:
          console.error("Unknow type:", type);
      }
    },
    [selectedNode]
  );
}
