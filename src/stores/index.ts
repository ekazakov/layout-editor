import { toJS } from "mobx";
import { RoadsStore } from "./roads";
import { CursorStore } from "./cursor";
import { SelectionStore } from "./selection";
import { UndoManagerStore } from "./undo-manager";
import { dump } from "../dumps/dump-1";
import { NodeStore, FixturesStore, SegmentStore } from "./nodes";
import { RoadsDump } from "../types";

export { RoadNode } from "./road-node";
export { RoadSegment } from "./road-segment";
export { Fixture, Gate } from "./fixture";
export { NodeStore, FixturesStore, SegmentStore } from "./nodes";

export const selectionStore = new SelectionStore();
export const cursorStore = new CursorStore();
export const roadsStore = new RoadsStore(selectionStore, cursorStore);

export const nodeStore = new NodeStore();
export const segmentStore = new SegmentStore();
export const fixtureStore = new FixturesStore();

export const undoManagerStore = new UndoManagerStore(
  () => roadsStore.toJSON(),
  (value) => {
    roadsStore.populate(value);
  },
);

roadsStore.populate(dump);
undoManagerStore.trackChanges();

// @ts-ignore
window.nodeStore = nodeStore;
// @ts-ignore
window.segmentStore = segmentStore;
// @ts-ignore
window.fixtureStore = fixtureStore;
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
