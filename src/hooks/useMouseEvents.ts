import React from "react";
import { runInAction, toJS } from "mobx";
import { roadsStore, cursorStore } from "../stores";
import { matchElementTypeAtPosition } from "../utils/find-hovered-element";

export function useMouseEvents() {
  const { selectedNode } = roadsStore;

  const onMouseDown = React.useCallback((evt: React.MouseEvent) => {
    const { altKey } = evt;
    const element = evt.target as HTMLElement;
    const {
      dataset: { type = "none" }
    } = element;

    switch (type) {
      case "canvas":
        break;
      case "road-node":
        break;

      // default:
      // console.error("Unknow type:", type);
    }
  }, []);

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
        const line = { start: selectedNode, end: cursorStore.position };
        roadsStore.updateIntersectionsWithRoad(line);
      }
    },
    [selectedNode]
  );

  const onMouseUp = React.useCallback(
    (evt: React.MouseEvent) => {
      const element = evt.target as HTMLElement;
      const {
        dataset: { type = "none" }
      } = element;

      switch (type) {
        case "road-node": {
          const gate = matchElementTypeAtPosition(
            cursorStore.position,
            "fixture-gate"
          );
          // console.log("g:", gate, "n:", selectedNode);
          if (gate && selectedNode) {
            roadsStore.connectToGate(gate.id, selectedNode);
          }
          // selectedNode?.position;
          break;
        }
        case "fixture-gate": {
          if (selectedNode && cursorStore.metaKey) {
          }
          break;
        }

        default:
          break;
      }
    },
    [selectedNode]
  );

  const onMouseOver = React.useCallback((evt: React.MouseEvent) => {
    const element = evt.target as HTMLElement;
    const {
      dataset: { type = "none" }
    } = element;
  }, []);
  const onMouseOut = React.useCallback((evt: React.MouseEvent) => {}, []);

  const onClick = React.useCallback(
    (evt: React.MouseEvent) => {
      const { altKey } = evt;
      const element = evt.target as HTMLElement;
      const {
        dataset: { type = "none" }
      } = element;

      switch (type) {
        case "road-node": {
          if (selectedNode && cursorStore.metaKey) {
            if (!roadsStore.isConnected(selectedNode.id, element.id)) {
              roadsStore.joinNodes(selectedNode.id, element.id);
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
        case "fixture": {
          roadsStore.toggleFixtureSelection(element.id);
          break;
        }
        case "fixture-gate": {
          runInAction(() => {
            if (selectedNode && cursorStore.metaKey) {
              const newNode = roadsStore.addNode({
                x: evt.clientX,
                y: evt.clientY
              });
              roadsStore.addSegment(selectedNode.id, newNode.id);
              roadsStore.toggleNodeSelection(newNode.id);
              roadsStore.connectToGate(element.id, newNode);
            }
          });
          break;
        }

        case "canvas": {
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
