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
import { findHoveredElements } from "../utils/find-hovered-element";

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

          if (cursorStore.shiftKey) {
            selectionManagerStore.addItemToSelection(element.id);
            return;
          }
          selectionManagerStore.selectSingleItem(element.id);

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

            if (cursorStore.shiftKey) {
              selectionManagerStore.addItemToSelection(element.id);
              return;
            }
            selectionManagerStore.selectSingleItem(element.id);
          });
          break;
        }
        case "fixture": {
          if (cursorStore.shiftKey) {
            selectionManagerStore.addItemToSelection(element.id);
            return;
          }
          selectionManagerStore.selectSingleItem(element.id);
          break;
        }
        case "fixture_gate": {
          runInAction(() => {
            if (selectedNode && cursorStore.metaKey) {
              const newNode = nodeStore.addNode(cursorStore.position);
              segmentStore.addSegment(selectedNode.id, newNode.id);
              selectionManagerStore.selectSingleItem(element.id);
              fixtureStore.connectToGate(element.id, newNode);
              return;
            }

            selectionManagerStore.selectSingleItem(element.id);
          });
          break;
        }

        case "bounding-rect": {
          // selectionManagerStore.removeItemFromSelection(element.id);
          // const element = document.elementsFromPoint(cursorStore.x,cursorStore.y);
          if (cursorStore.shiftKey) {
            const els = findHoveredElements(cursorStore.position);
            console.log("els:", els);
            const item = els.find(
              (el) => el.dataset.type === "road-node" || el.dataset.type === "fixture",
            );
            console.log("item:", item);
            if (item) {
              if (selectionManagerStore.isSelected(item.id)) {
                selectionManagerStore.removeItemFromSelection(item.id);
              } else {
                selectionManagerStore.addItemToSelection(item.id);
              }
            }
          }
          break;
        }

        case "selection-rect": {
          break;
        }

        case "canvas": {
          if (cursorStore.noKeys || cursorStore.shiftKey) {
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
      runInAction(() => {
        const { type } = extractItem(evt);
        cursorStore.update(evt);

        if (selectionRectStore.inProgress && cursorStore.noKeys) {
          selectionRectStore.setEnd(cursorStore.position);
          selectionManagerStore.selectionFromAria(selectionRectStore.rect);
          selectionRectStore.reset();
          if (selectionManagerStore.selected.type !== "multi") {
            selectionManagerStore.reset();
          }
        }

        if (selectionRectStore.inProgress && cursorStore.shiftKey) {
          selectionRectStore.setEnd(cursorStore.position);
          selectionManagerStore.selectionFromAria(selectionRectStore.rect, true);
          selectionRectStore.reset();
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
      });
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
              selectionManagerStore.selectSingleItem(newFixture.id);
              return;
            }

            if (cursorStore.altKey) {
              const newNode = nodeStore.addNode(cursorStore.position);
              selectionManagerStore.selectSingleItem(newNode.id);
              return;
            }

            if (selectedNode && cursorStore.metaKey) {
              const newNode = nodeStore.addNode(cursorStore.position);
              segmentStore.addSegment(selectedNode.id, newNode.id);
              selectionManagerStore.selectSingleItem(newNode.id);
              return;
            }

            if (selectedGate && cursorStore.metaKey) {
              const newNode = nodeStore.addNode(cursorStore.position);
              const startNode = nodeStore.addNode(selectedGate.position);
              fixtureStore.connectToGate(selectedGate.id, startNode);
              segmentStore.addSegment(startNode.id, newNode.id);
              selectionManagerStore.selectSingleItem(newNode.id);
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
