import { NodeStore } from "../nodes";
import { FixturesStore } from "../fixtures";
import { SegmentStore } from "../segments";
import { Item, Position, Rect, SelectableItemType, SelectionItem } from "../../types";
// import { getItemType } from "./utils/get-item-type";
import { makeAutoObservable, toJS } from "mobx";

export class MultiItems {
  private items: Map<string, SelectionItem> = new Map();

  moveSelection(delta: Position) {
    this.items.forEach(({ id, type }) => {
      switch (type) {
        case "fixture":
          this.fixtures.getFixture(id)?.moveBy(delta);
          break;
        case "node": {
          const node = this.nodes.get(id);
          if (node && !node.gateId) {
            node.moveBy(delta);
          }
          break;
        }
      }
    });
  }

  append(newItems: Map<string, SelectionItem>) {
    newItems.forEach((value, key) => {
      this.items.set(key, value);
    });
  }

  get list() {
    return [...this.items.values()];
  }

  hasItem(id: string) {
    return this.items.has(id);
  }

  remove(id: string) {
    return this.items.delete(id);
  }

  get pointList() {
    return this.list.reduce((result, { id, type }) => {
      switch (type) {
        case "fixture":
          const fixture = this.fixtures.getFixture(id);
          if (!fixture) {
            break;
          }
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
          const node = this.nodes.get(id);
          if (node) {
            result.push(toJS(node.position));
          }
          break;
      }

      return result;
    }, [] as Position[]);
  }

  get leftLimit() {
    return this.pointList.sort((a, b) => a.x - b.x).at(0)?.x ?? 0;
  }

  get rightLimit() {
    return this.pointList.sort((a, b) => b.x - a.x).at(0)?.x ?? 0;
  }

  get topLimit() {
    return this.pointList.sort((a, b) => a.y - b.y).at(0)?.y ?? 0;
  }

  get bottomLimit() {
    return this.pointList.sort((a, b) => b.y - a.y).at(0)?.y ?? 0;
  }

  get boundingRect(): Rect {
    return {
      top: this.topLimit - 10,
      left: this.leftLimit - 10,
      right: this.rightLimit + 10,
      bottom: this.bottomLimit + 10,
      height: Math.abs(this.bottomLimit - this.topLimit) + 20,
      width: Math.abs(this.rightLimit - this.leftLimit) + 20,
    };
  }

  constructor(
    items: Map<string, SelectionItem>,
    // private selectionRect: SelectionRect,
    private nodes: NodeStore,
    private segments: SegmentStore,
    private fixtures: FixturesStore,
  ) {
    this.items = items;
    makeAutoObservable(this);
  }
}
