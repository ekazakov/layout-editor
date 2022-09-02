import { toJS } from "mobx";
import { RoadsStore } from "./roads";
import { CursorStore } from "./cursor";
import { UndoManagerStore } from "./undo-manager";
import { dump } from "../dumps/dump-1";
import { NodeStore } from "./nodes";
import { SegmentStore } from "./segments";
import { FixturesStore } from "./fixtures";
import { SelectionManagerStore } from "./selection/selection-manager";
import { SelectionRect } from "./selection/selection-rect";

export { RoadNode } from "./road-node";
export { RoadSegment } from "./road-segment";
export { Fixture, Gate } from "./fixture";
export { NodeStore } from "./nodes";

export const selectionManagerStore = new SelectionManagerStore();
export const selectionRectStore = new SelectionRect();
export const cursorStore = new CursorStore();
export const nodeStore = new NodeStore();
export const segmentStore = new SegmentStore();
export const fixtureStore = new FixturesStore();

export const roadsStore = new RoadsStore(
  selectionManagerStore,
  cursorStore,
  nodeStore,
  segmentStore,
  fixtureStore,
);

selectionManagerStore.setNodes(nodeStore);
selectionManagerStore.setFixtures(fixtureStore);
selectionManagerStore.setSegments(segmentStore);

nodeStore.setSegments(segmentStore);
nodeStore.setFixtures(fixtureStore);
nodeStore.setSelection(selectionManagerStore);

segmentStore.setNodes(nodeStore);
segmentStore.setFixtures(fixtureStore);
segmentStore.setCursor(cursorStore);
segmentStore.setSelection(selectionManagerStore);

fixtureStore.setNodes(nodeStore);
fixtureStore.setCursor(cursorStore);
fixtureStore.setSelection(selectionManagerStore);

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
window.selectionManagerStore = selectionManagerStore;
// @ts-ignore
window.undoManagerStore = undoManagerStore;
// @ts-ignore
window.toJS = toJS;
export { SegmentStore } from "./segments";
export { FixturesStore } from "./fixtures";
