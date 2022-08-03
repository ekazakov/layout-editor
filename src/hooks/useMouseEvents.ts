import React from "react";
import { runInAction, toJS } from "mobx";
import { nodesStore, cursorStore } from "../stores";

export function useMouseEvents() {
  const { selectedNode } = nodesStore;

  const onMouseDown = React.useCallback(
    (evt: React.MouseEvent) => {
      // console.log("target:", evt.target);
      const { altKey } = evt;
      const element = evt.target as HTMLElement;
      const {
        dataset: { type = "none" }
      } = element;

      switch (type) {
        case "canvas":
          break;
        case "road-node": {
          if (selectedNode && cursorStore.metaKey) {
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

  const onMouseMove = React.useCallback(
    (evt: React.MouseEvent) => {
      cursorStore.setPostion({
        x: Math.round(evt.clientX),
        y: Math.round(evt.clientY)
      });
      cursorStore.setState({
        altKey: evt.altKey,
        ctrlKey: evt.ctrlKey,
        shiftKey: evt.shiftKey,
        metaKey: evt.metaKey
      });

      if (selectedNode && cursorStore.metaKey) {
        const line = { _p1: selectedNode, _p2: cursorStore.position };
        nodesStore.updateIntersectionsWithRoad(line);
      }
    },
    [selectedNode]
  );

  const onMouseUp = React.useCallback((evt: React.MouseEvent) => {}, []);

  const onMouseOver = React.useCallback((evt: React.MouseEvent) => {
    const element = evt.target as HTMLElement;
    const {
      dataset: { type = "none" }
    } = element;

    switch (type) {
      case "road-node": {
        break;
      }
      case "road-segment": {
        break;
      }

      default:
        return;
    }
  }, []);
  const onMouseOut = React.useCallback((evt: React.MouseEvent) => {}, []);

  const onClick = React.useCallback(
    (evt: React.MouseEvent) => {
      const element = evt.target as HTMLElement;
      const {
        dataset: { type = "none" }
      } = element;

      if (type === "canvas") {
        runInAction(() => {
          const newNode = nodesStore.addNode({
            x: evt.clientX,
            y: evt.clientY
          });
          // console.log("newNode:", newNode.id, "selected:", selectedNode?.id);
          if (selectedNode && cursorStore.metaKey) {
            // const newSegment = nodesStore.addSegment(
            //   selectedNode.id,
            //   newNode.id
            // );
            // nodesStore.updateIntersectionsWithRoad(newSegment);
            // console.log(toJS(nodesStore.intersections));
            nodesStore.createSegmentsFromIntersections(
              selectedNode.id,
              newNode.id
            );
            nodesStore.toggleNodeSelection(newNode.id);
          }
        });
      }
    },
    [selectedNode]
  );

  return {
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseOver,
    onMouseOut,
    onClick
  };
}
