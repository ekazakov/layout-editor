import React from "react";
import { runInAction, toJS } from "mobx";
import { roadsStore, cursorStore, selectionStore } from "../stores";
import { matchElementTypeAtPosition } from "../utils/find-hovered-element";
import { getDistance } from "../utils/get-distance";

export function useMouseEvents() {
  const { selectedNode, selectedGate } = roadsStore;

  const onMouseDown = React.useCallback((evt: React.MouseEvent) => {
    cursorStore.setState({
      altKey: evt.altKey,
      ctrlKey: evt.ctrlKey,
      shiftKey: evt.shiftKey,
      metaKey: evt.metaKey
    });
  }, []);

  const onMouseMove = React.useCallback(
    (evt: React.MouseEvent) => {
      runInAction(() => {
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

        const selectedItem = selectedNode || selectedGate;
        if (selectedItem && cursorStore.metaKey) {
          const line = {
            start: selectedItem,
            end: cursorStore.position
          };
          roadsStore.updateIntersectionsWithRoad(line);
          return;
        }
        if (selectedNode?.gateId) {
          const gate = roadsStore.getGate(selectedNode.gateId)!;
          if (getDistance(gate, selectedNode) > 10) {
            gate.disconnect();
          }
          return;
        }
      });
    },
    [selectedNode, selectedGate]
  );

  const onMouseUp = React.useCallback(
    (evt: React.MouseEvent) => {
      cursorStore.setState({
        altKey: evt.altKey,
        ctrlKey: evt.ctrlKey,
        shiftKey: evt.shiftKey,
        metaKey: evt.metaKey
      });
      const element = evt.target as HTMLElement;
      const {
        dataset: { type = "none" }
      } = element;

      switch (type) {
        case "road-node": {
          runInAction(() => {
            const gate = matchElementTypeAtPosition(
              cursorStore.position,
              "fixture-gate"
            );
            // console.log("g:", gate, "n:", selectedNode);
            if (gate && selectedNode && !cursorStore.metaKey) {
              roadsStore.connectToGate(gate.id, selectedNode);
            }
          });

          break;
        }
        case "fixture-gate": {
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
          selectionStore.nodeId = element.id;
          //roadsStore.toggleNodeSelection(element.id);
          break;
        }
        case "road-segment": {
          if (altKey) {
            roadsStore.splitSegmentAt(element.id, {
              x: evt.clientX,
              y: evt.clientY
            });
          } else {
            selectionStore.segmentId = element.id;
            // roadsStore.toggleSegmentSelection(element.id);
          }
          break;
        }
        case "fixture": {
          selectionStore.fixtureId = element.id;
          // roadsStore.toggleFixtureSelection(element.id);
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
              selectionStore.gateId = element.id;
              // roadsStore.toggleNodeSelection(newNode.id);
              roadsStore.connectToGate(element.id, newNode);
              return;
            }

            selectionStore.gateId = element.id;
            // roadsStore.toggleGateSelection(element.id);
          });
          break;
        }

        case "canvas": {
          runInAction(() => {
            if (cursorStore.altKey) {
              const newNode = roadsStore.addNode(cursorStore.position);
              selectionStore.nodeId = newNode.id;
              return;
            }

            if (selectedNode && cursorStore.metaKey) {
              const newNode = roadsStore.addNode(cursorStore.position);
              roadsStore.addSegment(selectedNode.id, newNode.id);
              selectionStore.nodeId = newNode.id;
              // roadsStore.toggleNodeSelection(newNode.id);
              return;
            }

            if (selectedGate && cursorStore.metaKey) {
              const newNode = roadsStore.addNode(cursorStore.position);
              const startNode = roadsStore.addNode(selectedGate.position);
              roadsStore.connectToGate(selectedGate.id, startNode);
              roadsStore.addSegment(startNode.id, newNode.id);
              selectionStore.nodeId = newNode.id;
              // roadsStore.toggleNodeSelection(newNode.id);
              return;
            }

            selectionStore.reset();
          });
        }
      }
    },
    [selectedNode, selectedGate]
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
