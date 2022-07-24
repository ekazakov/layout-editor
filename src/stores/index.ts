import { NodesStore } from "./roads";
import { CursorStore } from "./cursor";

export const nodesStore = new NodesStore();
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
  nodesStore.addNode({ x, y });
});

// @ts-ignore
window.nodesStore = nodesStore;
// @ts-ignore
window.cursorStore = cursorStore;
