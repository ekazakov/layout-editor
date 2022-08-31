import { NodeStore } from "../nodes";
import { FixturesStore } from "../fixtures";
import { SegmentStore } from "../segments";
import { Item, Position, Rect } from "../../types";
import { getItemType } from "./utils/get-item-type";
import { makeAutoObservable, toJS } from "mobx";

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

  pointList() {
    return this.list.reduce((result, item) => {
      switch (getItemType(item)) {
        case "fixture":
          const fixture = this.fixtures.getFixture(item.id)!;
          const { top, left, right, bottom } = fixture.rect;
          const points = [
            { x: left, y: top },
            { x: left, y: bottom },
            { x: right, y: top },
            { x: right, y: bottom },
          ];
          result.push(...points);
          break;
        case "node":
          const node = this.nodes.get(item.id)!;
          result.push(toJS(node.position));
          break;
      }

      return result;
    }, [] as Position[]);
  }

  get leftLimit() {
    return this.pointList()
      .sort((a, b) => a.x - b.x)
      .at(0)!.x;
  }

  get rightLimit() {
    return this.pointList()
      .sort((a, b) => b.x - a.x)
      .at(0)!.x;
  }

  get topLimit() {
    return this.pointList()
      .sort((a, b) => a.y - b.y)
      .at(0)!.y;
  }

  get bottomLimit() {
    return this.pointList()
      .sort((a, b) => b.y - a.y)
      .at(0)!.y;
  }

  get boundingRect(): Rect {
    return {
      top: this.topLimit,
      left: this.leftLimit,
      right: this.rightLimit,
      bottom: this.bottomLimit,
      height: Math.abs(this.bottomLimit - this.topLimit),
      width: Math.abs(this.rightLimit - this.leftLimit),
    };
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
