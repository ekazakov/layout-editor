import { comparer, reaction, makeAutoObservable } from "mobx";

export class UndoManagerStore<T = any> {
  readObservable: () => T;

  setObservable: (value: T) => void;

  private readonly undoStack: T[];

  private _stopTrackingChanges: (() => void) | undefined = undefined;

  private undoPointer: number;

  isPaused: boolean = false;

  stopTrackingChanges() {
    this.isPaused = true;
    this._stopTrackingChanges?.();
  }

  private update(value: T) {
    // @ts-ignore
    if (this.undoStack[this.undoPointer].version === value.version) {
      return;
    }

    this.undoPointer += 1;
    this.undoStack[this.undoPointer] = value;
    this.undoStack.length = this.undoPointer + 1;
  }

  trackChanges = () => {
    this._stopTrackingChanges?.();
    this._stopTrackingChanges = reaction(
      this.readObservable,
      (newValue) => {
        this.update(newValue);
      },
      { equals: comparer.structural, name: "ChangesTracking" },
    );
  };

  updateUndoStack = () => {
    if (!this.isPaused) {
      return;
    }
    this.isPaused = false;
    this.update(this.readObservable());
  };

  undo = () => {
    if (this.undoPointer === 0) return;

    this.undoPointer -= 1;

    this.updateTracker();
  };

  redo = () => {
    if (this.undoPointer >= this.undoStack.length - 1) return;
    this.undoPointer += 1;

    this.updateTracker();
  };

  updateTracker = () => {
    this.stopTrackingChanges();
    this.setObservable(this.undoStack[this.undoPointer]);
    this.trackChanges();
  };

  get pointer() {
    return this.undoPointer + 1;
  }

  get size() {
    return this.undoStack.length;
  }

  constructor(readObservable: () => T, setObservable: (value: T) => void) {
    this.readObservable = readObservable;
    this.setObservable = setObservable;
    this.undoStack = [this.readObservable()];
    this.undoPointer = this.undoStack.length - 1;

    makeAutoObservable(this);
  }
}
