import { toJS, getDependencyTree, getObserverTree } from "mobx";
import { CursorStore } from "./cursor";
import { UndoManagerStore } from "./undo-manager";
import { dump } from "../dumps/dump-3";
import { NodeStore } from "./nodes";
import { SegmentStore } from "./segments";
import { FixturesStore } from "./fixtures";
import { SelectionManagerStore } from "./selection/selection-manager";
import { SelectionRect } from "./selection/selection-rect";
import { GlobalSettings } from "./global-settings";
import { DndStore } from "./dnd-store";
import { RoadBuilder } from "./road-builder";
export { RoadNode } from "./road-node";
export { RoadSegment } from "./road-segment";
export { Fixture, Gate } from "./fixture";
export { NodeStore } from "./nodes";

export const selectionStore = new SelectionManagerStore();
export const selectionRectStore = new SelectionRect();
export const cursorStore = new CursorStore();
export const nodeStore = new NodeStore();
export const segmentStore = new SegmentStore();
export const fixtureStore = new FixturesStore();

selectionStore.init(nodeStore, segmentStore, fixtureStore);

nodeStore.setSegments(segmentStore);
nodeStore.setFixtures(fixtureStore);

segmentStore.setNodes(nodeStore);
segmentStore.setFixtures(fixtureStore);
segmentStore.setCursor(cursorStore);
segmentStore.setSelection(selectionStore);

fixtureStore.setNodes(nodeStore);
fixtureStore.setCursor(cursorStore);

export const roadBuilder = new RoadBuilder(
  selectionStore,
  cursorStore,
  nodeStore,
  segmentStore,
  fixtureStore,
  selectionRectStore,
);
roadBuilder.populate(dump);

export const undoManagerStore = new UndoManagerStore(
  () => roadBuilder.toJSON,
  (value) => {
    roadBuilder.populate(value);
  },
);

export const dndStore = new DndStore(selectionStore, cursorStore, undoManagerStore, nodeStore);

export const globalSettingsStore = new GlobalSettings();
undoManagerStore.trackChanges();

// @ts-ignore
window.nodeStore = nodeStore;
// @ts-ignore
window.segmentStore = segmentStore;
// @ts-ignore
window.fixtureStore = fixtureStore;
// @ts-ignore
window.roadBuilder = roadBuilder;
// @ts-ignore
window.cursorStore = cursorStore;
// @ts-ignore
window.selectionManagerStore = selectionStore;
// @ts-ignore
window.undoManagerStore = undoManagerStore;
// @ts-ignore
window.globalSettingsStore = globalSettingsStore;
// @ts-ignore
window.toJS = toJS;

// @ts-ignore
window.getDependencyTree = getDependencyTree;
// @ts-ignore
window.getObserverTree = getObserverTree;
export { SegmentStore } from "./segments";
export { FixturesStore } from "./fixtures";
