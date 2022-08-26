import { toJS } from "mobx";
import { RoadsStore } from "./roads";
import { CursorStore } from "./cursor";
import { SelectionStore } from "./selection";
import { UndoManagerStore } from "./undo-manager";
import { dump } from "../dumps/dump-1";
import { NodeStore } from "./nodes";
import { SegmentStore } from "./segments";
import { FixturesStore } from "./fixtures";

export { RoadNode } from "./road-node";
export { RoadSegment } from "./road-segment";
export { Fixture, Gate } from "./fixture";
export { NodeStore } from "./nodes";

export const selectionStore = new SelectionStore();
export const cursorStore = new CursorStore();
export const nodeStore = new NodeStore();
export const segmentStore = new SegmentStore();
export const fixtureStore = new FixturesStore();

export const roadsStore = new RoadsStore(
  selectionStore,
  cursorStore,
  nodeStore,
  segmentStore,
  fixtureStore,
);

nodeStore.setSegments(segmentStore);
nodeStore.setFixtures(fixtureStore);
nodeStore.setSelection(selectionStore);

segmentStore.setNodes(nodeStore);
segmentStore.setFixtures(fixtureStore);
segmentStore.setCursor(cursorStore);
segmentStore.setSelection(selectionStore);

fixtureStore.setNodes(nodeStore);
fixtureStore.setCursor(cursorStore);
fixtureStore.setSelection(selectionStore);

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
export { SegmentStore } from "./segments";
export { FixturesStore } from "./fixtures";
