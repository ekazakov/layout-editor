import { toJS } from "mobx";
import { RoadsStore } from "./roads";
import { CursorStore } from "./cursor";
import { SelectionStore } from "./selection";
import { UndoManagerStore } from "./undo-manager";
import { dump } from "../dumps/dump-1";
import { RoadsDump } from "../types";

export { RoadNode } from "./road-node";
export { RoadSegment } from "./road-segment";
export { Fixture } from "./fixture";

export const selectionStore = new SelectionStore();
export const roadsStore = new RoadsStore(selectionStore);
export const cursorStore = new CursorStore();

export const undoManagerStore = new UndoManagerStore(
  () => roadsStore.toJSON(),
  (value) => {
    roadsStore.populate(value);
  }
);

roadsStore.initFixrures();

// roadsStore.populate(dump);
undoManagerStore.trackChanges();

// @ts-ignore
window.roadsStore = roadsStore;
// @ts-ignore
window.cursorStore = cursorStore;
// @ts-ignore
window.selectionStore = selectionStore;
// @ts-ignore
window.undoManagerStore = undoManagerStore;
// @ts-ignore
window.toJS = toJS;
