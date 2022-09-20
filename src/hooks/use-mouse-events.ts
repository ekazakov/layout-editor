import React from "react";
import { runInAction } from "mobx";
import {
  roadBuilder,
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
  const { selectedNode, selectedGate } = roadBuilder;

  const onMouseDown = React.useCallback(
    (evt: React.MouseEvent) => {
      const { element, type } = extractItem(evt);
      cursorStore.update(evt);

      runInAction(() => {
        switch (type) {
          case "road-node": {
            roadBuilder.matchAction([
              roadBuilder.addSegment,
              roadBuilder.addItemToSelection,
              roadBuilder.selectItem,
            ]);
            break;
          }
          case "road-segment": {
            roadBuilder.matchAction([
              roadBuilder.splitSegment,
              roadBuilder.connectNodeToSegment,
              roadBuilder.addItemToSelection,
              roadBuilder.selectItem,
            ]);
            break;
          }
          case "fixture": {
            roadBuilder.matchAction([roadBuilder.addItemToSelection, roadBuilder.selectItem]);
            break;
          }
          case "fixture_gate": {
            roadBuilder.matchAction([
              roadBuilder.connectSegmentToFixture,
              roadBuilder.connectFixtureToFixture,
              roadBuilder.selectItem,
            ]);

            break;
          }

          case "bounding-rect": {
            roadBuilder.matchAction([roadBuilder.toggleItemInSelection]);
            break;
          }

          case "canvas": {
            roadBuilder.matchAction([roadBuilder.startMultiSelection]);
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

        //  roadBuilder.matchAction([
        //    roadBuilder.updateSegmentIntersectionsAndSnaps,
        //    roadBuilder.updateGateSnaps,
        //  ]);
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

        // TODO: move to reaction?
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

        //  roadBuilder.matchAction([
        //    roadBuilder.finishMultiSelection,
        //  ]);
        if (selectionRectStore.inProgress) {
          selectionRectStore.setEnd(cursorStore.position);
          selectionStore.selectionFromAria(selectionRectStore.rect, cursorStore.shiftKey);
          selectionRectStore.reset();
        }
      });
    },
    [selectedNode],
  );

  const onMouseOver = React.useCallback(() => {}, []);

  const onMouseOut = React.useCallback(() => {}, []);

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
            //  roadBuilder.matchAction([
            //    roadBuilder.addFixture,
            //    roadBuilder.addNode,
            //    roadBuilder.connectNodeToSegmentWithSnapping,
            //    roadBuilder.addSegment,
            //    roadBuilder.addSegmentFromGate,
            //  ]);
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
