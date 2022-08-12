import { comparer, reaction, makeAutoObservable, action } from "mobx";
import { debounce } from "lodash";

export class UndoManagerStore<T> {
  isDisposed: boolean = false;

  readObservable: () => T;

  setObservable: (value: T) => void;

  undoStack: T[];

  stopTrackingChanges: () => void = undefined!;

  undoPointer: number;

  trackChanges = () => {
    this.stopTrackingChanges = () => {};
    // this.stopTrackingChanges = reaction(
    //   this.readObservable,
    //   (newValue) => {
    //     if (this.isDisposed) throw new Error("Undo already disposed");
    //     // console.log("newValue:", newValue);
    //     this.undoPointer += 1;
    //     this.undoStack[this.undoPointer] = newValue;
    //     this.undoStack.length = this.undoPointer + 1;
    //   },
    //   { equals: comparer.structural }
    // );
  };

  createTrackWithDebounce = (delay = 150) => {
    const updateUndoStackDebounced = debounce(() => {
      // this.undoPointer += 1;
      // this.undoStack[this.undoPointer] = this.readObservable();
      // this.undoStack.length = this.undoPointer + 1;
    }, delay);

    return action((callback: () => void) => {
      this.stopTrackingChanges();
      // console.log("run tracker");
      callback();
      updateUndoStackDebounced();
      this.trackChanges();
    });
  };

  doNotTrack = (notTrackableCallback: () => void) => {
    // this.stopTrackingChanges();
    // notTrackableCallback();
    // this.trackChanges();
  };

  resetTracker = () => {
    // this.stopTrackingChanges();
    // this.undoStack = [this.readObservable()];
    // this.undoPointer = 0;
    // this.setObservable(this.undoStack[this.undoPointer]);
    // this.trackChanges();
  };

  undo = () => {
    if (this.isDisposed) throw new Error("Undo already disposed");

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
    // this.stopTrackingChanges();
    // this.setObservable(this.undoStack[this.undoPointer]);
    // this.trackChanges();
  };

  constructor(readObservable: () => T, setObservable: (value: T) => void) {
    this.readObservable = readObservable;
    this.setObservable = setObservable;
    this.undoStack = [this.readObservable()];
    this.undoPointer = this.undoStack.length - 1;

    makeAutoObservable(this);
  }
}
