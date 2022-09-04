import { makeAutoObservable } from "mobx";
import { Position, Rect, Selection, SelectionItem } from "../../types";
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

  selectSingleItem(id: string) {
    this.selected = {
      type: "single",
      value: new SingleItem(id),
    };
  }

  private selectFromRect(rect: Rect) {
    const items = new Map<string, SelectionItem>();

    this.nodes.list.forEach((node) => {
      if (isInsideRect(node.position, rect)) {
        const { id } = node;
        items.set(node.id, { id, type: "node" });
        node.segmentIds.forEach((segmentId) => {
          items.set(segmentId, { id: segmentId, type: "segment" });
        });
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
    const { type, value } = this.selected;
    if (type === "multi") {
      value.moveSelection(delta);
    } else if (type === "single") {
      switch (value.type) {
        case "node":
          this.nodes.get(value.id)?.moveBy(delta);
          break;
        case "fixture":
          this.fixtures.getFixture(value.id)?.moveBy(delta);
          break;
      }
    }
  }

  // selectMultiplyItems(rect: Rect | undefined) {
  //   if (!rect) {
  //     throw new Error(`Selection rect is not defined`);
  //   }
  //   const items = this.selectFromRect(rect);
  //   if (items.size === 0) {
  //     this.reset();
  //     return;
  //   }
  //   this.selected = {
  //     type: "multi",
  //     value: new MultiItems(items, this.nodes, this.segments, this.fixtures),
  //   };
  // }

  selectionFromAria(rect: Rect | undefined, append = false) {
    if (!rect) {
      throw new Error(`Selection rect is not defined`);
    }

    const items = this.selectFromRect(rect);

    if (items.size === 0) {
      if (!append) {
        this.reset();
      }
      return;
    }

    const { type, value } = this.selected;
    switch (type) {
      case "none": {
        if (items.size === 1) {
          const [id] = [...items.keys()];
          this.addItemToSelection(id);
        } else {
          this.selected = {
            type: "multi",
            value: new MultiItems(items, this.nodes, this.segments, this.fixtures),
          };
        }
        return;
      }
      case "single": {
        if (append) {
          const { id, type } = value;
          items.set(id, { id, type });
          this.selected = {
            type: "multi",
            value: new MultiItems(items, this.nodes, this.segments, this.fixtures),
          };
        } else {
          if (items.size === 1) {
            const [id] = [...items.keys()];
            this.addItemToSelection(id);
          } else {
            this.selected = {
              type: "multi",
              value: new MultiItems(items, this.nodes, this.segments, this.fixtures),
            };
          }
        }
        return;
      }
      case "multi": {
        value.append(items);
        return;
      }
    }

    // const items = this.selectFromRect(rect);
    // if (this.selected.type !== "multi") {
    //   this.selected = {
    //     type: "multi",
    //     value: new MultiItems(items, this.nodes, this.segments, this.fixtures),
    //   };
    //   return;
    // }
    //
    // this.selected.value.append(items);
  }

  addItemToSelection(id: string) {
    console.log("addItemToSelection:", id);
    const selection = this.selected;

    if (selection.type === "none") {
      this.selectSingleItem(id);
      return;
    }

    const type = getItemType(id);
    const rawItems: [string, SelectionItem][] = [[id, { id, type }]];
    if (type === "segment") {
      const segment = this.segments.get(id);
      if (segment) {
        const startId = segment.start.id;
        const endId = segment.end.id;
        rawItems.push([startId, { id: startId, type: "node" }]);
        rawItems.push([endId, { id: endId, type: "node" }]);
      }
    }
    const items = new Map<string, SelectionItem>(rawItems);

    if (selection.type === "single") {
      const { id, type } = selection.value;
      items.set(id, { id, type });
      this.selected = {
        type: "multi",
        value: new MultiItems(items, this.nodes, this.segments, this.fixtures),
      };
    } else {
      selection.value.append(items);
    }
  }

  isSelected(id: string) {
    if (this.selected.type === "multi") {
      return this.selected.value.hasItem(id);
    }

    if (this.selected.type === "single") {
      return this.selected.value.isSelected(id);
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
