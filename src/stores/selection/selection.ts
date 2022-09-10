import { NodeStore } from "../nodes";
import { FixturesStore } from "../fixtures";
import { SegmentStore } from "../segments";
import { Position, Rect, SelectionItem } from "../../types";
import { makeAutoObservable, toJS } from "mobx";
import { getItemType } from "./utils/get-item-type";

export class Selection {
  private items: Map<string, SelectionItem> = new Map();

  moveSelection(delta: Position) {
    const nodes = new Set(this.selectedNodes.map((node) => node.id));

    this.selectedSegments.forEach(({ id }) => {
      const segment = this.segments.get(id);
      if (segment) {
        nodes.add(segment.start.id);
        nodes.add(segment.end.id);
      }
    });

    this.selectedFixtures.forEach(({ id }) => {
      const fixture = this.fixtures.getFixture(id);
      if (fixture) {
        fixture?.moveBy(delta);
      }
    });

    nodes.forEach((id) => {
      const node = this.nodes.get(id);
      if (node) {
        if (node.fixtureId) {
          return;
        }
        node.moveBy(delta);
      }
    });
  }

  addItem(id: string) {
    this.items.set(id, { id, type: getItemType(id) });
  }

  appendItems(newItems: Set<string> | string[]) {
    newItems.forEach((item) => {
      this.addItem(item);
    });
  }

  get list() {
    return [...this.items.values()];
  }

  get selectedNodes(): ReadonlyArray<SelectionItem> {
    return this.list.filter((item) => item.type === "node");
  }

  get selectedSegments(): ReadonlyArray<SelectionItem> {
    return this.list.filter((item) => item.type === "segment");
  }

  get selectedFixtures(): ReadonlyArray<SelectionItem> {
    return this.list.filter((item) => item.type === "fixture");
  }

  hasItem(id: string) {
    return this.items.has(id);
  }

  remove(id: string) {
    return this.items.delete(id);
  }

  reset() {
    this.items.clear();
  }

  private get pointList() {
    return this.list.reduce((result, { id, type }) => {
      switch (type) {
        case "fixture": {
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
        }
        case "node": {
          const node = this.nodes.get(id);
          if (node) {
            result.push(toJS(node.position));
          }
          break;
        }
        case "segment": {
          const segment = this.segments.get(id);
          if (segment) {
            const { start, end } = segment;
            result.push(toJS(start.position));
            result.push(toJS(end.position));
          }
          break;
        }
      }

      return result;
    }, [] as Position[]);
  }

  private get leftLimit() {
    return this.pointList.sort((a, b) => a.x - b.x).at(0)?.x ?? 0;
  }

  private get rightLimit() {
    return this.pointList.sort((a, b) => b.x - a.x).at(0)?.x ?? 0;
  }

  private get topLimit() {
    return this.pointList.sort((a, b) => a.y - b.y).at(0)?.y ?? 0;
  }

  private get bottomLimit() {
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

  get count() {
    return this.items.size;
  }

  constructor(
    private nodes: NodeStore,
    private segments: SegmentStore,
    private fixtures: FixturesStore,
  ) {
    makeAutoObservable(this);
  }
}
