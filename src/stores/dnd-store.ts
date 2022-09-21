import { makeAutoObservable } from "mobx";
import { SelectionManagerStore } from "./selection/selection-manager";
import { CursorStore } from "./cursor";
import { NodeStore } from "./nodes";
import { Position } from "../types";
import { UndoManagerStore } from "./undo-manager";
import { cursorStore } from "./index";

function subtract(p1: Position, p2: Position) {
  return {
    x: p1.x - p2.x,
    y: p1.y - p2.y,
  };
}

export class DndStore {
  private isDragging: boolean = false;

  startDrag = () => {
    this.isDragging = true;
    this.undoManager.stopTrackingChanges();
  };

  endDrag = () => {
    this.undoManager.updateUndoStack();
    this.undoManager.trackChanges();
    this.isDragging = false;
  };

  onDrag = () => {
    if (!this.isDragging) {
      return;
    }

    const nodeId = this.selection.getSingleSelection("node");
    const node = this.nodes.getNode(nodeId);
    if (node) {
      const diff = subtract(cursorStore.snapPosition, node.position);
      node.moveBy(diff);
      return;
    }

    this.selection.moveBy(this.cursor.movement);
  };

  constructor(
    private selection: SelectionManagerStore,
    private cursor: CursorStore,
    private undoManager: UndoManagerStore,
    private nodes: NodeStore,
  ) {
    makeAutoObservable(this);
  }
}
