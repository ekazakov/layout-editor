import { comparer, reaction, makeAutoObservable } from "mobx";

export class UndoManagerStore<T> {
  isDisposed: boolean = false;

  readObservable: () => T;

  setObservable: (value: T) => void;

  undoStack: T[];

  private _stopTrackingChanges: (() => void) | undefined = undefined;

  undoPointer: number;

  isPaused: boolean = false;

  stopTrackingChanges() {
    this.isPaused = true;
    this._stopTrackingChanges?.();
  }

  trackChanges = () => {
    this._stopTrackingChanges = reaction(
      this.readObservable,
      (newValue) => {
        if (this.isDisposed) throw new Error("Undo already disposed");
        this.undoPointer += 1;
        this.undoStack[this.undoPointer] = newValue;
        this.undoStack.length = this.undoPointer + 1;
      },
      { equals: comparer.structural },
    );
  };

  trackUp = () => {
    if (!this.isPaused) {
      return;
    }
    this.isPaused = false;
    this.undoPointer += 1;
    this.undoStack[this.undoPointer] = this.readObservable();
    this.undoStack.length = this.undoPointer + 1;
  };

  doNotTrack = (notTrackableCallback: () => void) => {
    // this.stopTrackingChanges();
    // notTrackableCallback();
    // this.trackChanges();
  };

  undo = () => {
    if (this.isDisposed) throw new Error("Undo already disposed");

    // console.log("undo");
    if (this.undoPointer === 0) return;

    this.undoPointer -= 1;

    this.updateTracker();
  };

  redo = () => {
    if (this.isDisposed) throw new Error("Undo already disposed");

    if (this.undoPointer >= this.undoStack.length - 1) return;
    this.undoPointer += 1;

    this.updateTracker();
  };

  dispose = () => {
    this.stopTrackingChanges();
    this.isDisposed = true;
  };

  updateTracker = () => {
    this.stopTrackingChanges();
    this.setObservable(this.undoStack[this.undoPointer]);
    this.trackChanges();
  };

  constructor(readObservable: () => T, setObservable: (value: T) => void) {
    this.readObservable = readObservable;
    this.setObservable = setObservable;
    this.undoStack = [this.readObservable()];
    this.undoPointer = this.undoStack.length - 1;

    makeAutoObservable(this);
  }
}
