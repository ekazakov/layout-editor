import { computed, makeAutoObservable, reaction } from "mobx";
import { ItemType, Position, Rect } from "../../types";
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
    this.selection.addItem(id);
  }

  private selectFromRect(rect: Rect) {
    const items = new Set<string>();

    this.nodes.list.forEach((node) => {
      if (isInsideRect(node.position, rect)) {
        items.add(node.id);
      }
    });

    this.segments.list.forEach((segment) => {
      if (isLineRectIntersection(segment, rect)) {
        items.add(segment.id);
      }
    });

    this.fixtures.list.forEach((fixture) => {
      if (isRectIntersection(fixture.rect, rect)) {
        items.add(fixture.id);
        fixture.gateList.forEach((gate) => {
          const node = gate.connection;
          if (node) {
            items.add(node.id);
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
    const type = getItemType(id);
    if (type === "fixture_gate") {
      return;
    }

    this.selection.addItem(id);
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

  selectOnlyNodes() {
    const nodes = this.selection.selectedNodes;
    this.selection.reset();
    this.selection.appendItems(nodes.map((n) => n.id));
  }

  selectOnlySegments() {
    const segments = this.selection.selectedSegments;
    this.selection.reset();
    this.selection.appendItems(segments.map((s) => s.id));
  }

  selectOnlyFixtures() {
    const fixtures = this.selection.selectedFixtures;
    this.selection.reset();
    this.selection.appendItems(fixtures.map((f) => f.id));
  }

  constructor() {
    makeAutoObservable(this, {
      isEmpty: computed({ keepAlive: true }),
    });
  }

  private resetIfEmpty() {
    const item = this.selection.list.at(0);
    if (this.isSingle && item) {
      switch (item.type) {
        case "fixture":
          if (!this.fixtures.has(item.id)) {
            this.reset();
          }
          break;
        case "node":
          if (!this.nodes.has(item.id)) {
            this.reset();
          }
          break;
        case "segment":
          if (!this.segments.has(item.id)) {
            this.reset();
          }
          break;
      }
    }
  }

  private subscribeOnNodeDeletion() {
    reaction(
      () => this.nodes.count,
      (newCount, oldCount) => {
        if (newCount < oldCount) {
          this.resetIfEmpty();
        }
      },
      { name: "DeleteNodeReaction" },
    );
  }

  private subscribeOnSegmentDeletion() {
    reaction(
      () => this.segments.count,
      (newCount, oldCount) => {
        if (newCount < oldCount) {
          this.resetIfEmpty();
        }
      },
      { name: "DeleteSegmentReaction" },
    );
  }

  private subscribeOnFixtureDeletion() {
    reaction(
      () => this.fixtures.count,
      (newCount, oldCount) => {
        if (newCount < oldCount) {
          this.resetIfEmpty();
        }
      },
      { name: "DeleteFixtureReaction" },
    );
  }

  init(nodes: NodeStore, segments: SegmentStore, fixtures: FixturesStore) {
    this.nodes = nodes;
    this.fixtures = fixtures;
    this.segments = segments;
    this.selection = new Selection(nodes, segments, fixtures);

    // TODO: as alternative we can add reaction to every id in selection, and react on it
    this.subscribeOnNodeDeletion();
    this.subscribeOnFixtureDeletion();
    this.subscribeOnSegmentDeletion();
  }
}
