import { makeAutoObservable } from "mobx";
import { Item, ItemType, Position, Rect, Selection } from "../../types";
import { NodeStore } from "../nodes";
import { SegmentStore } from "../segments";
import { FixturesStore } from "../fixtures";
import { isInsideRect } from "../../utils/is-inside-rect";
import { isRectIntersection } from "../../utils/is-rect-intersection";
import { getItemType } from "./utils/get-item-type";
import { SingleItem } from "./single-item";
import { MultiItems } from "./multi-items";

export type NoneSelectionItem = Readonly<{ type: "none"; value: { id: undefined } }>;

export const NoneSelection: NoneSelectionItem = {
  type: "none",
  value: { id: undefined },
};

export class SelectionManagerStore {
  selected: Selection = NoneSelection;

  private nodes: NodeStore = null!;
  private fixtures: FixturesStore = null!;
  private segments: SegmentStore = null!;

  selectSingleItem(id: string, type: ItemType) {
    this.selected = {
      type: "single",
      value: new SingleItem(id, type),
    };
  }

  private selectFromRect(rect: Rect) {
    const items = new Map<string, Item>();

    this.nodes.list.forEach((node) => {
      if (isInsideRect(node.position, rect)) {
        items.set(node.id, node);
        node.segmentIds.forEach((segmentId) => {
          items.set(segmentId, this.segments.get(segmentId)!);
        });
      }
    });

    this.fixtures.list.forEach((fixture) => {
      if (isRectIntersection(fixture.rect, rect)) {
        items.set(fixture.id, fixture);
      }
    });

    return items;
  }

  moveMultiSelection(delta: Position) {
    if (this.selected.type === "multi") {
      this.selected.value.moveSelection(delta);
    }
  }

  selectMultiplyItems(rect: Rect | undefined) {
    if (!rect) {
      throw new Error(`Selection rect is not defined`);
    }
    const items = this.selectFromRect(rect);
    if (items.size === 0) {
      this.reset();
      return;
    }
    this.selected = {
      type: "multi",
      value: new MultiItems(items, this.nodes, this.segments, this.fixtures),
    };
  }

  addRectToSelection(rect: Rect | undefined) {
    if (!rect) {
      throw new Error(`Selection rect is not defined`);
    }

    const items = this.selectFromRect(rect);
    if (this.selected.type !== "multi") {
      this.selected = {
        type: "multi",
        value: new MultiItems(items, this.nodes, this.segments, this.fixtures),
      };
      return;
    }

    this.selected.value.append(items);
  }

  // TODO: refactor to pass only id and type
  addItemToSelection(item: Item) {
    const selection = this.selected;
    switch (selection.type) {
      case "single": {
        const items = new Map<string, Item>([[item.id, item]]);
        this.selected = {
          type: "multi",
          value: new MultiItems(items, this.nodes, this.segments, this.fixtures),
        };
        return;
      }
      case "multi": {
        const items = new Map<string, Item>([[item.id, item]]);
        selection.value.append(items);
        return;
      }
      case "none":
        this.selectSingleItem(item.id, getItemType(item));
        return;
    }
  }

  isSelected(id: string) {
    if (this.selected.type === "multi") {
      return this.selected.value.hasItem(id);
    }

    if (this.selected.type === "single") {
      return this.selected.value.id === id;
    }

    return false;
  }

  reset() {
    this.selected = NoneSelection;
  }

  constructor() {
    makeAutoObservable(this);
  }

  setNodes(nodes: NodeStore) {
    this.nodes = nodes;
  }

  setFixtures(fixtures: FixturesStore) {
    this.fixtures = fixtures;
  }

  setSegments(segments: SegmentStore) {
    this.segments = segments;
  }
}
