import { makeAutoObservable } from "mobx";
import { ItemType, RoadsDump, SelectableItemType } from "../types";
import { RoadNode } from "./road-node";
import { RoadSegment } from "./road-segment";
import { Fixture } from "./fixture";

import { CursorStore } from "./cursor";
import { NodeStore } from "./nodes";
import { SegmentStore } from "./segments";
import { FixturesStore } from "./fixtures";
import { SelectionManagerStore } from "./selection/selection-manager";

export class RoadsStore {
  private readonly selection: SelectionManagerStore;
  private readonly cursor: CursorStore;
  private readonly nodes: NodeStore;
  private readonly fixtures: FixturesStore;
  private readonly segments: SegmentStore;

  populate(dump: RoadsDump) {
    this.empty();
    dump.nodes.forEach((dump) => {
      const node = RoadNode.populate(dump);
      this.nodes.set(node.id, node);
    });
    dump.segments.forEach((dump) => {
      const nodeStart = this.nodes.get(dump.startNodeId)!;
      const nodeEnd = this.nodes.get(dump.endNodeId)!;
      const segment = new RoadSegment(nodeStart, nodeEnd, dump.id);
      this.segments.set(segment.id, segment);
    });
    dump.fixtures.forEach((dump) => {
      const fixture = Fixture.populate(dump, this.nodes);
      this.fixtures.set(fixture.id, fixture);
    });
  }

  private getSelectedItemId(type: ItemType) {
    const selected = this.selection.selected;
    if (selected.type !== "single") {
      return "";
    }

    if (selected.value.type === type) {
      return selected.value.id;
    }

    return "";
  }

  get selectedNode() {
    return this.nodes.get(this.getSelectedItemId("node"));
  }

  get selectedGate() {
    return this.fixtures.getGate(this.getSelectedItemId("node"));
  }

  private deleteItem(id: string, type: SelectableItemType) {
    switch (type) {
      case "fixture":
        return this.fixtures.deleteFixture(id);
      case "node":
        return this.nodes.deleteNode(id);
      case "segment":
        return this.segments.deleteSegment(id);
      default:
        return false;
    }
  }

  deleteSelection() {
    const { selected } = this.selection;

    if (selected.type === "multi") {
      if (selected.value.list.length === 0) {
        return false;
      }

      selected.value.list.forEach((item) => {
        this.deleteItem(item.id, item.type);
      });
    }

    if (selected.type === "single") {
      this.deleteItem(selected.value.id, selected.value.type);
    }
  }

  empty() {
    this.nodes.clear();
    this.segments.clear();
    this.fixtures.clear();

    this.selection.reset();
  }

  constructor(
    selection: SelectionManagerStore,
    cursor: CursorStore,
    nodes: NodeStore,
    segments: SegmentStore,
    fixtures: FixturesStore,
  ) {
    makeAutoObservable(this);
    this.selection = selection;
    this.cursor = cursor;
    this.nodes = nodes;
    this.segments = segments;
    this.fixtures = fixtures;
  }

  toJSON() {
    return {
      nodes: this.nodes.list.map((value) => value.toJSON()),
      segments: this.segments.list.map((value) => value.toJSON()),
      fixtures: this.fixtures.list.map((value) => value.toJSON()),
    } as RoadsDump;
  }
}
