import { makeAutoObservable, reaction, when } from "mobx";
import { SelectionManagerStore } from "./selection/selection-manager";
import { CursorStore } from "./cursor";
import { NodeStore } from "./nodes";
import { Position } from "../types";
import { UndoManagerStore } from "./undo-manager";
import { cursorStore, dndStore, undoManagerStore } from "./index";

function subtract(p1: Position, p2: Position) {
  return {
    x: p1.x - p2.x,
    y: p1.y - p2.y,
  };
}

export class DndStore {
  private start: Position | undefined = undefined;
  private end: Position | undefined = undefined;
  private isDragging: boolean = false;

  startDrag = () => {
    this.isDragging = true;
    this.undoManager.stopTrackingChanges();
    this.start = { x: this.cursor.snapPosition.x, y: this.cursor.snapPosition.y };
  };

  endDrag = () => {
    if (this.isDragHappened) {
      this.undoManager.updateUndoStack();
    }
    this.undoManager.trackChanges();

    this.isDragging = false;
    this.start = undefined;
  };

  onDrag = () => {
    if (!this.isDragging) {
      return;
    }

    const nodeId = this.selection.getSingleSelection("node");
    const node = this.nodes.get(nodeId);
    if (node) {
      const diff = subtract(cursorStore.snapPosition, node.position);
      node.moveBy(diff);
      return;
    }

    this.selection.moveBy(this.cursor.movement);
  };

  private get isDragHappened() {
    if (!this.start) {
      return false;
    }

    const end = { x: this.cursor.snapPosition.x, y: this.cursor.snapPosition.y };
    return Math.abs(end.x - this.start.x) > 1 || Math.abs(end.y - this.start.y) > 0;
  }

  constructor(
    private selection: SelectionManagerStore,
    private cursor: CursorStore,
    private undoManager: UndoManagerStore,
    private nodes: NodeStore,
  ) {
    makeAutoObservable(this);
  }
}
