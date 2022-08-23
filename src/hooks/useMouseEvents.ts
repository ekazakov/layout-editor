import React from "react";
import { runInAction, toJS } from "mobx";
import { roadsStore, cursorStore, selectionStore } from "../stores";
// import { matchElementTypeAtPosition } from "../utils/find-hovered-element";
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
        buttons: evt.buttons
      });

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

          break;
        }
        case "road-segment": {
          runInAction(() => {
            if (!selectedNode && cursorStore.altKey) {
              roadsStore.splitSegmentAt(element.id, cursorStore);
              return;
            }

            if (selectedNode && cursorStore.metaKey) {
              const node = roadsStore.splitSegmentAt(element.id, cursorStore);
              roadsStore.joinNodes(selectedNode.id, node.id);
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
              const newNode = roadsStore.addNode({
                x: evt.clientX,
                y: evt.clientY
              });
              roadsStore.addSegment(selectedNode.id, newNode.id);
              selectionStore.gateId = element.id;

              roadsStore.connectToGate(element.id, newNode);
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
          // selectionStore.reset();
          selectionStore.setStat(cursorStore.position);

          break;
        }
      }
    },
    [selectedNode, selectedGate]
  );

  const onMouseMove = React.useCallback(
    (evt: React.MouseEvent) => {
      const element = evt.target as HTMLElement;
      const {
        dataset: { type = "none" }
      } = element;
      runInAction(() => {
        cursorStore.setPostion({
          x: Math.round(evt.clientX),
          y: Math.round(evt.clientY)
        });
        cursorStore.setState({
          altKey: evt.altKey,
          ctrlKey: evt.ctrlKey,
          shiftKey: evt.shiftKey,
          metaKey: evt.metaKey,
          buttons: evt.buttons
        });

        const selectedItem = selectedNode || selectedGate;
        if (selectedItem && cursorStore.metaKey) {
          const line = {
            start: selectedItem,
            end: cursorStore.position
          };
          roadsStore.updateIntersectionsWithRoad(line);
          roadsStore.updateSnapPoints(cursorStore.position);
          return;
        }

        if (selectedNode && !selectedNode.gateId && cursorStore.buttons === 1) {
          roadsStore.updateSnapGates();

          return;
        }

        if (selectedNode?.gateId && cursorStore.buttons === 1) {
          const gate = roadsStore.getGate(selectedNode.gateId);

          if (gate && getDistance(gate, cursorStore) > 30) {
            gate.disconnect();
            cursorStore.resetSanpping();
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
        metaKey: evt.metaKey,
        buttons: evt.buttons
      });
      const element = evt.target as HTMLElement;
      const {
        dataset: { type = "none" }
      } = element;

      // console.log("s:", selectionStore.start, "e:", selectionStore.end);
      if (selectionStore.start && !selectionStore.end) {
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
          // if (selectedNode && cursorStore.metaKey) {
          //   if (!roadsStore.isConnected(selectedNode.id, element.id)) {
          //     roadsStore.joinNodes(selectedNode.id, element.id);
          //   }
          // }
          // selectionStore.nodeId = element.id;
          break;
        }
        case "road-segment": {
          // runInAction(() => {
          //   if (altKey) {
          //     roadsStore.splitSegmentAt(element.id, cursorStore);
          //     return;
          //   }

          //   if (selectedNode && cursorStore.metaKey) {
          //     const node = roadsStore.splitSegmentAt(element.id, cursorStore);
          //     roadsStore.joinNodes(selectedNode.id, node.id);
          //     return;
          //   }

          //   selectionStore.segmentId = element.id;
          // });
          break;
        }
        case "fixture": {
          // selectionStore.fixtureId = element.id;
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
              roadsStore.connectToGate(element.id, newNode);
              return;
            }

            selectionStore.gateId = element.id;
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
