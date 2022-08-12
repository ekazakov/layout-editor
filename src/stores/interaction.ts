import { makeAutoObservable, reaction, toJS } from "mobx";
import { RoadsStore } from "./roads";
import { CursorStore } from "./cursor";
import { SelectionStore } from "./selection";

export class InteractionStore {
  private roads: RoadsStore;
  private cursor: CursorStore;
  private selection: SelectionStore;

  match(intrs: Array<(...args: any[]) => string>) {}

  updateNewSegmentIntersections = () => {
    const selectedItem = this.roads.selectedNode || this.roads.selectedGate;
    if (selectedItem && this.cursor.metaKey) {
      return "skip";
    }

    const line = {
      start: selectedItem,
      end: this.cursor.position
    };
    this.roads.updateIntersectionsWithRoad(line);
    return "done";
  };

  constructor(
    roads: RoadsStore,
    cursor: CursorStore,
    selection: SelectionStore
  ) {
    makeAutoObservable(this);
  }
}
