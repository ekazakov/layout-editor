import React from "react";
import { runInAction } from "mobx";
import { roadBuilder, cursorStore } from "../stores";

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
      const { type } = extractItem(evt);
      cursorStore.update(evt);

      runInAction(() => {
        switch (type) {
          case "road-node": {
            roadBuilder.matchAction([
              roadBuilder.connectNodes,
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

        roadBuilder.matchAction([
          roadBuilder.updateSegmentIntersectionsAndSnaps,
          roadBuilder.updateGateSnaps,
        ]);
      });
    },
    [selectedNode, selectedGate],
  );

  const onMouseUp = React.useCallback(
    (evt: React.MouseEvent) => {
      runInAction(() => {
        cursorStore.update(evt);
        roadBuilder.matchAction([roadBuilder.finishMultiSelection]);
      });
    },
    [selectedNode],
  );

  const onMouseOver = React.useCallback(() => {}, []);

  const onMouseOut = React.useCallback(() => {}, []);

  const onClick = React.useCallback(
    (evt: React.MouseEvent) => {
      runInAction(() => {
        const { type } = extractItem(evt);

        switch (type) {
          case "canvas": {
            roadBuilder.matchAction([
              roadBuilder.addFixture,
              roadBuilder.addNode,
              roadBuilder.connectNodeToSegmentWithSnapping,
              roadBuilder.addSegment,
              roadBuilder.addSegmentFromGate,
            ]);
            break;
          }
        }
      });
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
