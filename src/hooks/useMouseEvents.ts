import React from "react";
import { runInAction } from "mobx";
import {
  roadsStore,
  cursorStore,
  selectionManagerStore,
  nodeStore,
  segmentStore,
  fixtureStore,
  selectionRectStore,
} from "../stores";
import { getDistance } from "../utils/get-distance";

function extractItem(evt: React.MouseEvent) {
  const element = evt.target as HTMLElement;
  const {
    dataset: { type = "none" },
  } = element;

  return { element, type };
}

export function useMouseEvents() {
  const { selectedNode, selectedGate } = roadsStore;

  const onMouseDown = React.useCallback(
    (evt: React.MouseEvent) => {
      const { element, type } = extractItem(evt);
      cursorStore.update(evt);

      switch (type) {
        case "road-node": {
          if (selectedNode && cursorStore.metaKey) {
            if (!nodeStore.isConnected(selectedNode.id, element.id)) {
              segmentStore.joinNodes(selectedNode.id, element.id);
            }
          }
          selectionManagerStore.selectSingleItem(element.id, "node");

          break;
        }
        case "road-segment": {
          runInAction(() => {
            if (!selectedNode && cursorStore.altKey) {
              segmentStore.splitSegmentAt(element.id, cursorStore);
              return;
            }

            if (selectedNode && cursorStore.metaKey) {
              const node = segmentStore.splitSegmentAt(element.id, cursorStore);
              segmentStore.joinNodes(selectedNode.id, node.id);
              return;
            }

            selectionManagerStore.selectSingleItem(element.id, "segment");
          });
          break;
        }
        case "fixture": {
          selectionManagerStore.selectSingleItem(element.id, "fixture");
          break;
        }
        case "fixture_gate": {
          runInAction(() => {
            if (selectedNode && cursorStore.metaKey) {
              const newNode = nodeStore.addNode(cursorStore.position);
              segmentStore.addSegment(selectedNode.id, newNode.id);
              selectionManagerStore.selectSingleItem(element.id, "fixture_gate");
              fixtureStore.connectToGate(element.id, newNode);
              return;
            }

            selectionManagerStore.selectSingleItem(element.id, "fixture_gate");
          });
          break;
        }

        case "selection-rect": {
          break;
        }

        case "canvas": {
          if (cursorStore.noKeys) {
            selectionRectStore.setStart(cursorStore.position);
          }

          break;
        }
      }
    },
    [selectedNode, selectedGate],
  );

  const onMouseMove = React.useCallback(
    (evt: React.MouseEvent) => {
      // const { element, type } = extractItem(evt);
      runInAction(() => {
        cursorStore.update(evt);

        const selectedItem = selectedNode || selectedGate;
        if (selectedItem && cursorStore.metaKey) {
          const line = {
            start: selectedItem,
            end: cursorStore.position,
          };
          segmentStore.updateIntersectionsWithRoad(line);
          segmentStore.updateSnapPoints(cursorStore.position);
          return;
        }

        if (selectedNode && !selectedNode.gateId && cursorStore.isLeftButtonPressed) {
          fixtureStore.updateSnapGates();

          return;
        }

        if (selectedNode?.gateId && cursorStore.isLeftButtonPressed) {
          const gate = fixtureStore.getGate(selectedNode.gateId);

          if (gate && getDistance(gate, cursorStore) > 30) {
            gate.disconnect();
            cursorStore.resetSnapping();
          }
          return;
        }
      });
    },
    [selectedNode, selectedGate],
  );

  const onMouseUp = React.useCallback(
    (evt: React.MouseEvent) => {
      const { type } = extractItem(evt);
      cursorStore.update(evt);

      if (selectionRectStore.inProgress && cursorStore.noKeys) {
        selectionRectStore.setEnd(cursorStore.position);
        selectionManagerStore.selectMultiplyItems(selectionRectStore.rect);
        if (selectionManagerStore.selected.type !== "multi") {
          selectionManagerStore.reset();
          selectionRectStore.reset();
        }
      }

      switch (type) {
        case "road-node": {
          break;
        }
        case "fixture_gate": {
          break;
        }

        default:
          break;
      }
    },
    [selectedNode],
  );

  const onMouseOver = React.useCallback((evt: React.MouseEvent) => {}, []);
  const onMouseOut = React.useCallback((evt: React.MouseEvent) => {}, []);

  const onClick = React.useCallback(
    (evt: React.MouseEvent) => {
      const { type } = extractItem(evt);

      switch (type) {
        case "road-node": {
          break;
        }
        case "road-segment": {
          break;
        }
        case "fixture": {
          break;
        }
        case "fixture_gate": {
          break;
        }

        case "canvas": {
          runInAction(() => {
            if (cursorStore.altKey && cursorStore.shiftKey) {
              const newFixture = fixtureStore.addFixture(cursorStore.position);
              selectionManagerStore.selectSingleItem(newFixture.id, "fixture");
              return;
            }

            if (cursorStore.altKey) {
              const newNode = nodeStore.addNode(cursorStore.position);
              selectionManagerStore.selectSingleItem(newNode.id, "node");
              return;
            }

            if (selectedNode && cursorStore.metaKey) {
              const newNode = nodeStore.addNode(cursorStore.position);
              segmentStore.addSegment(selectedNode.id, newNode.id);
              selectionManagerStore.selectSingleItem(newNode.id, "node");
              return;
            }

            if (selectedGate && cursorStore.metaKey) {
              const newNode = nodeStore.addNode(cursorStore.position);
              const startNode = nodeStore.addNode(selectedGate.position);
              fixtureStore.connectToGate(selectedGate.id, startNode);
              segmentStore.addSegment(startNode.id, newNode.id);
              selectionManagerStore.selectSingleItem(newNode.id, "node");
              return;
            }
          });
        }
      }
    },
    [selectedNode, selectedGate],
  );

  return {
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseOver,
    onMouseOut,
    onClick,
  };
}
