import { makeAutoObservable, reaction, toJS } from "mobx";
import { RoadsStore } from "./roads";
import { CursorStore } from "./cursor";

export class InteractionStore {
  // private roads: RoadsStore;
  // private cursor: CursorStore;
  // private selection: SelectionStore;

  match(intrs: Array<(...args: any[]) => string>) {}

  updateNewSegmentIntersections = () => {
    const selectedItem = this.roads.selectedNode || this.roads.selectedGate;

    if (!selectedItem) {
      return "skip";
    }

    if (selectedItem && this.cursor.metaKey) {
      return "skip";
    }

    const line = {
      start: selectedItem.position,
      end: this.cursor.position,
    };
    // this.roads.updateIntersectionsWithRoad(line);
    return "done";
  };

  constructor(private roads: RoadsStore, private cursor: CursorStore) {
    makeAutoObservable(this);
  }
}
