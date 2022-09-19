import React from "react";
import { runInAction } from "mobx";
import {
  roadsStore,
  cursorStore,
  selectionStore,
  nodeStore,
  segmentStore,
  fixtureStore,
  selectionRectStore,
} from "../stores";
import { getDistance } from "../utils/get-distance";
import { findHoveredElements, matchElementTypeAtPosition } from "../utils/find-hovered-element";

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

      runInAction(() => {
        switch (type) {
          /*
            roadBuilder.match([
              roadBuilder.createSegment,
              roadBuilder.addItemsToSelection,
              roadBuilder.selectItem,
            ])
           */
          case "road-node": {
            // isSegmentCreation
            if (selectedNode && cursorStore.metaKey) {
              if (!nodeStore.isConnected(selectedNode.id, element.id)) {
                segmentStore.addSegment(selectedNode.id, element.id);
              }
            }

            // isMultiSelectionMode
            if (cursorStore.shiftKey) {
              selectionStore.addItemToSelection(element.id);
              return;
            }

            // isSingleSelectionMode
            selectionStore.selectSingleItem(element.id);

            break;
          }
          case "road-segment": {
            /*
            roadBuilder.match([
              roadBuilder.splitSegment,
              roadBuilder.createNewSegment,
              roadBuilder.addItemToSelection,
              roadBuilder.selectItem,
            ])
           */
            if (!selectedNode && cursorStore.altKey) {
              segmentStore.splitSegmentAt(element.id, cursorStore.position);
              return;
            }

            if (selectedNode && cursorStore.metaKey) {
              const node = segmentStore.splitSegmentAt(element.id, cursorStore.position);
              segmentStore.addSegment(selectedNode.id, node.id);
              return;
            }

            if (cursorStore.shiftKey) {
              selectionStore.addItemToSelection(element.id);
              return;
            }
            selectionStore.selectSingleItem(element.id);
            break;
          }
          case "fixture": {
            /*
             roadBuilder.match([
              roadBuilder.addItemToSelection,
              roadBuilder.selectItem,
            ])
            */
            if (cursorStore.shiftKey) {
              selectionStore.addItemToSelection(element.id);
              return;
            }
            selectionStore.selectSingleItem(element.id);
            break;
          }
          case "fixture_gate": {
           /*
            roadBuilder.match([
             roadBuilder.connectSegmentToFixture,
             roadBuilder.connectFixtureToFixture,
             roadBuilder.selectItem,
           ])
           */
            if (selectedNode && cursorStore.metaKey) {
              const newNode = nodeStore.createNoe(cursorStore.position);
              segmentStore.addSegment(selectedNode.id, newNode.id);
              selectionStore.selectSingleItem(element.id);
              fixtureStore.connectToGate(element.id, newNode);
              return;
            }

            if (selectedGate && cursorStore.metaKey && selectedGate.id !== element.id) {
              const startNode = nodeStore.createNoe(selectedGate.position);
              const endNode = nodeStore.createNoe(cursorStore.position);
              segmentStore.addSegment(startNode.id, endNode.id);
              fixtureStore.connectToGate(element.id, endNode);
              fixtureStore.connectToGate(selectedGate.id, startNode);
              selectionStore.selectSingleItem(endNode.id);
              return;
            }

            selectionStore.selectSingleItem(element.id);
            break;
          }

          case "bounding-rect": {
            /*
           roadBuilder.match([
            roadBuilder.addItemToSelection,
            roadBuilder.removeItemFromSelection,
          ])
          */
            if (cursorStore.shiftKey) {
              const els = findHoveredElements(cursorStore.position);
              const types = ["road-node", "road-segment", "fixture"];
              const item = els.find(({ dataset: { type } }) => types.includes(type ?? ""));
              if (item) {
                if (selectionStore.isSelected(item.id)) {
                  selectionStore.removeItemFromSelection(item.id);
                } else {
                  selectionStore.addItemToSelection(item.id);
                }
              }
            }
            break;
          }

          case "selection-rect": {
            break;
          }

          case "canvas": {
            // roadBuilder.startMultiSelection
            if (cursorStore.noKeys || cursorStore.shiftKey) {
              selectionRectStore.setStart(cursorStore.position);
            }

            break;
          }
        }
      });
    },
    [selectedNode, selectedGate],
  );

  const onMouseMove = React.useCallback(
    (evt: React.MouseEvent) => {
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
        cursorStore.update(evt);

        if (selectionRectStore.inProgress && cursorStore.noKeys) {
          selectionRectStore.setEnd(cursorStore.position);
          selectionStore.selectionFromAria(selectionRectStore.rect);
          selectionRectStore.reset();
        }

        if (selectionRectStore.inProgress && cursorStore.shiftKey) {
          selectionRectStore.setEnd(cursorStore.position);
          selectionStore.selectionFromAria(selectionRectStore.rect, true);
          selectionRectStore.reset();
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
              selectionStore.selectSingleItem(newFixture.id);
              return;
            }

            if (cursorStore.altKey) {
              const newNode = nodeStore.createNoe(cursorStore.position);
              selectionStore.selectSingleItem(newNode.id);
              return;
            }

            if (selectedNode && cursorStore.metaKey && cursorStore.isSnapped) {
              // console.log("Segment snapped");
              const element = matchElementTypeAtPosition(cursorStore.snapPosition, "road-segment");
              if (element?.id) {
                const node = segmentStore.splitSegmentAt(element.id, cursorStore.snapPosition);
                segmentStore.addSegment(selectedNode.id, node.id);
              }
              return;
            }

            if (selectedNode && cursorStore.metaKey) {
              const newNode = nodeStore.createNoe(cursorStore.position);
              segmentStore.addSegment(selectedNode.id, newNode.id);
              selectionStore.selectSingleItem(newNode.id);
              return;
            }

            if (selectedGate && cursorStore.metaKey) {
              const newNode = nodeStore.createNoe(cursorStore.position);
              const startNode = nodeStore.createNoe(selectedGate.position);
              fixtureStore.connectToGate(selectedGate.id, startNode);
              segmentStore.addSegment(startNode.id, newNode.id);
              selectionStore.selectSingleItem(newNode.id);
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
