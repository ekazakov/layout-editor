import { makeAutoObservable } from "mobx";
import { ItemType, Position, Rect, SelectionItem } from "../../types";
import { NodeStore } from "../nodes";
import { SegmentStore } from "../segments";
import { FixturesStore } from "../fixtures";
import { isInsideRect } from "../../utils/is-inside-rect";
import { isRectIntersection } from "../../utils/is-rect-intersection";
import { getItemType } from "./utils/get-item-type";
import { Selection } from "./selection";
import { isLineRectIntersection } from "../../utils/is-line-rect-intersection";

export class SelectionManagerStore {
  private nodes: NodeStore = null!;
  private fixtures: FixturesStore = null!;
  private segments: SegmentStore = null!;

  private selection: Selection = null!;

  selectSingleItem(id: string) {
    this.selection.reset();
    this.selection.addItem({ id, type: getItemType(id) });
  }

  private selectFromRect(rect: Rect) {
    const items = new Map<string, SelectionItem>();

    this.nodes.list.forEach((node) => {
      if (isInsideRect(node.position, rect)) {
        const { id } = node;
        items.set(node.id, { id, type: "node" });
      }
    });

    this.segments.list.forEach((segment) => {
      if (isLineRectIntersection(segment, rect)) {
        items.set(segment.id, { id: segment.id, type: "segment" });
      }
    });

    this.fixtures.list.forEach((fixture) => {
      if (isRectIntersection(fixture.rect, rect)) {
        items.set(fixture.id, { id: fixture.id, type: "fixture" });
        fixture.gateList.forEach((gate) => {
          const node = gate.connection;
          if (node) {
            items.set(node.id, { id: node.id, type: "node" });
          }
        });
      }
    });

    return items;
  }

  moveBy(delta: Position) {
    this.selection.moveSelection(delta);
  }

  selectionFromAria(rect: Rect | undefined, append = false) {
    if (!rect) {
      throw new Error(`Selection rect is not defined`);
    }

    if (!append) {
      this.reset();
    }

    const items = this.selectFromRect(rect);
    this.selection.appendItems(items);
  }

  addItemToSelection(id: string) {
    const item = { id, type: getItemType(id) };

    if (item.type === "fixture_gate") {
      return;
    }

    this.selection.addItem(item);
  }

  removeItemFromSelection(id: string) {
    if (!this.isMulti) {
      return;
    }

    this.selection.remove(id);
  }

  isSelected(id: string) {
    return this.selection.hasItem(id);
  }

  reset() {
    this.selection.reset();
  }

  get selectedCount() {
    return this.selection.count;
  }

  get isSingle() {
    return this.selectedCount === 1;
  }

  get isEmpty() {
    return this.selectedCount === 0;
  }

  get isMulti() {
    return this.selectedCount > 1;
  }

  get list() {
    return this.selection.list;
  }

  get boundingRect() {
    return this.selection.boundingRect;
  }

  getSingleSelection(type: ItemType) {
    if (!this.isSingle) {
      return "";
    }

    const item = this.selection.list?.at(0);

    if (!item?.type || type !== item.type) {
      return "";
    }

    return item.id;
  }

  constructor() {
    makeAutoObservable(this);
  }

  init(nodes: NodeStore, segments: SegmentStore, fixtures: FixturesStore) {
    this.nodes = nodes;
    this.fixtures = fixtures;
    this.segments = segments;
    this.selection = new Selection(nodes, segments, fixtures);
  }
}
