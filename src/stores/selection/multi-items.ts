import { NodeStore } from "../nodes";
import { FixturesStore } from "../fixtures";
import { SegmentStore } from "../segments";
import { Item, Position, Rect } from "../../types";
import { getItemType } from "./utils/get-item-type";
import { makeAutoObservable } from "mobx";

export class MultiItems {
  private items: Map<string, Item> = new Map();

  moveSelection(delta: Position) {
    this.items.forEach((item) => {
      const type = getItemType(item);
      switch (type) {
        case "fixture":
          this.fixtures.getFixture(item.id)?.moveBy(delta, false);
          break;
        case "node":
          this.nodes.get(item.id)?.moveBy(delta);
          break;
        case "segment":
          this.segments.get(item.id)?.moveBy(delta, false);
          break;
      }
    });
    // this.selectionRect.moveBy(delta);
  }

  append(newItems: Map<string, Item>) {
    newItems.forEach((value, key) => {
      this.items.set(key, value);
    });
  }

  get list() {
    return [...this.items.values()];
  }

  reset() {
    this.items.clear();
  }

  hasItem(id: string) {
    return this.items.has(id);
  }

  constructor(
    items: Map<string, Item>,
    // private selectionRect: SelectionRect,
    private nodes: NodeStore,
    private segments: SegmentStore,
    private fixtures: FixturesStore,
  ) {
    this.items = items;
    makeAutoObservable(this);
  }
}
