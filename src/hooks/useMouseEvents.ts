import React from "react";
import { runInAction, toJS } from "mobx";
import { roadsStore, cursorStore } from "../stores";

export function useMouseEvents() {
  const { selectedNode } = roadsStore;

  const onMouseDown = React.useCallback(
    (evt: React.MouseEvent) => {
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
            if (!roadsStore.isConnected(selectedNode.id, element.id)) {
              roadsStore.addSegment(selectedNode.id, element.id);
            }
          }
          roadsStore.toggleNodeSelection(element.id);
          break;
        }
        case "road-segment": {
          if (altKey) {
            roadsStore.splitSegmentAt(element.id, {
              x: evt.clientX,
              y: evt.clientY
            });
          } else {
            roadsStore.toggleSegmentSelection(element.id);
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
        roadsStore.updateIntersectionsWithRoad(line);
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
          const newNode = roadsStore.addNode({
            x: evt.clientX,
            y: evt.clientY
          });
          if (selectedNode && cursorStore.metaKey) {
            roadsStore.addSegment(selectedNode.id, newNode.id);
            roadsStore.toggleNodeSelection(newNode.id);
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
