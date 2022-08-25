import React from "react";
import { runInAction, toJS } from "mobx";
import {
  roadsStore,
  cursorStore,
  selectionStore,
  nodeStore,
  segmentStore,
  fixtureStore,
} from "../stores";
import { getDistance } from "../utils/get-distance";

export function useMouseEvents() {
  const { selectedNode, selectedGate } = roadsStore;

  const onMouseDown = React.useCallback(
    (evt: React.MouseEvent) => {
      cursorStore.setState({
        altKey: evt.altKey,
        ctrlKey: evt.ctrlKey,
        shiftKey: evt.shiftKey,
        metaKey: evt.metaKey,
        buttons: evt.buttons,
      });

      const element = evt.target as HTMLElement;
      const {
        dataset: { type = "none" },
      } = element;

      switch (type) {
        case "road-node": {
          if (selectedNode && cursorStore.metaKey) {
            if (!nodeStore.isConnected(selectedNode.id, element.id)) {
              segmentStore.joinNodes(selectedNode.id, element.id);
            }
          }
          selectionStore.nodeId = element.id;

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

            selectionStore.segmentId = element.id;
          });
          break;
        }
        case "fixture": {
          selectionStore.fixtureId = element.id;
          break;
        }
        case "fixture-gate": {
          runInAction(() => {
            if (selectedNode && cursorStore.metaKey) {
              const newNode = nodeStore.addNode({
                x: evt.clientX,
                y: evt.clientY,
              });
              segmentStore.addSegment(selectedNode.id, newNode.id);
              selectionStore.gateId = element.id;
              fixtureStore.connectToGate(element.id, newNode);
              return;
            }

            selectionStore.gateId = element.id;
          });
          break;
        }

        case "selection-rect": {
          console.log("selection rect selected");
          break;
        }

        case "canvas": {
          if (cursorStore.noKeys) {
            selectionStore.setStart(cursorStore.position);
          }

          break;
        }
      }
    },
    [selectedNode, selectedGate],
  );

  const onMouseMove = React.useCallback(
    (evt: React.MouseEvent) => {
      const element = evt.target as HTMLElement;
      const {
        dataset: { type = "none" },
      } = element;
      runInAction(() => {
        cursorStore.setPostion({
          x: Math.round(evt.clientX),
          y: Math.round(evt.clientY),
        });
        cursorStore.setState({
          altKey: evt.altKey,
          ctrlKey: evt.ctrlKey,
          shiftKey: evt.shiftKey,
          metaKey: evt.metaKey,
          buttons: evt.buttons,
        });

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

        if (selectedNode && !selectedNode.gateId && cursorStore.buttons === 1) {
          fixtureStore.updateSnapGates();

          return;
        }

        if (selectedNode?.gateId && cursorStore.buttons === 1) {
          const gate = fixtureStore.getGate(selectedNode.gateId);

          if (gate && getDistance(gate, cursorStore) > 30) {
            gate.disconnect();
            cursorStore.resetSanpping();
          }
          return;
        }
      });
    },
    [selectedNode, selectedGate],
  );

  const onMouseUp = React.useCallback(
    (evt: React.MouseEvent) => {
      cursorStore.setState({
        altKey: evt.altKey,
        ctrlKey: evt.ctrlKey,
        shiftKey: evt.shiftKey,
        metaKey: evt.metaKey,
        buttons: evt.buttons,
      });
      const element = evt.target as HTMLElement;
      const {
        dataset: { type = "none" },
      } = element;

      // console.log("s:", selectionStore.start, "e:", selectionStore.end);
      if (selectionStore.start && !selectionStore.end && cursorStore.noKeys) {
        selectionStore.setEnd(cursorStore.position);
        roadsStore.updateMultiSelect();
      }

      switch (type) {
        case "road-node": {
          break;
        }
        case "fixture-gate": {
          break;
        }

        default:
          break;
      }
    },
    [selectedNode],
  );

  const onMouseOver = React.useCallback((evt: React.MouseEvent) => {
    const element = evt.target as HTMLElement;
    const {
      dataset: { type = "none" },
    } = element;
  }, []);
  const onMouseOut = React.useCallback((evt: React.MouseEvent) => {}, []);

  const onClick = React.useCallback(
    (evt: React.MouseEvent) => {
      const { altKey } = evt;
      const element = evt.target as HTMLElement;
      const {
        dataset: { type = "none" },
      } = element;

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
        case "fixture-gate": {
          break;
        }

        case "canvas": {
          runInAction(() => {
            if (cursorStore.altKey) {
              const newNode = nodeStore.addNode(cursorStore.position);
              selectionStore.nodeId = newNode.id;
              return;
            }

            if (selectedNode && cursorStore.metaKey) {
              const newNode = nodeStore.addNode(cursorStore.position);
              segmentStore.addSegment(selectedNode.id, newNode.id);
              selectionStore.nodeId = newNode.id;
              return;
            }

            if (selectedGate && cursorStore.metaKey) {
              const newNode = nodeStore.addNode(cursorStore.position);
              const startNode = nodeStore.addNode(selectedGate.position);
              fixtureStore.connectToGate(selectedGate.id, startNode);
              segmentStore.addSegment(startNode.id, newNode.id);
              selectionStore.nodeId = newNode.id;
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
