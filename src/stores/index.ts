import { toJS } from "mobx";
import { RoadsStore } from "./roads";
import { CursorStore } from "./cursor";
import { SelectionStore } from "./selection";

export { RoadNode } from "./road-node";
export { RoadSegment } from "./road-segment";

export const selectionStore = new SelectionStore();
export const roadsStore = new RoadsStore(selectionStore);
export const cursorStore = new CursorStore();

const pos: [number, number][] = [
  // [66, 59],
  // [33, 101],
  // [140, 70],
  // [210, 95],
  // [500, 200],
  // [194, 380],
  // [296, 332],
  // [123, 220],
  // [248, 193],
  // [436, 423]
];

pos.forEach(([x, y]) => {
  roadsStore.addNode({ x, y });
});

// @ts-ignore
window.roadsStore = roadsStore;
// @ts-ignore
window.cursorStore = cursorStore;
// @ts-ignore
window.selectionStore = selectionStore;
// @ts-ignore
window.toJS = toJS;
