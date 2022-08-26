import { makeAutoObservable } from "mobx";
import { Position, RoadsDump } from "../types";
import { RoadNode } from "./road-node";
import { RoadSegment } from "./road-segment";
import { Fixture } from "./fixture";
import { SelectionItem, SelectionStore } from "./selection";
import { isInsideRect } from "../utils/is-inside-rect";

import { CursorStore } from "./cursor";
import { isRectIntersection } from "../utils/is-rect-intersection";
import { FixturesStore, NodeStore, SegmentStore } from "./nodes";

export class RoadsStore {
  private readonly selection: SelectionStore;
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

  get selectedNode() {
    return this.nodes.get(this.selection.nodeId || "");
  }

  get selectedGate() {
    return this.fixtures.getGate(this.selection.gateId || "");
  }

  deleteSelection() {
    if (Array.isArray(this.selection.selected)) {
      this.selection.selected.forEach((item) => {
        switch (item.type) {
          case "fixture":
            return this.fixtures.deleteFixture(item.id);
          case "node":
            return this.nodes.deleteNode(item.id);
          case "segment":
            return this.segments.deleteSegment(item.id);
        }
      });
      return false;
    }

    switch (this.selection.selected.type) {
      case "fixture":
        return this.fixtures.deleteFixture(this.selection.fixtureId);
      case "node":
        return this.nodes.deleteNode(this.selection.nodeId);
      case "segment":
        return this.segments.deleteSegment(this.selection.segmentId);
      default:
        return false;
    }
  }

  updateMultiSelect() {
    const selection = new Map<string, SelectionItem>();
    if (this.selection.selectionRect === undefined) {
      console.warn("Multi selection is not active");
      return;
    }
    const rect = this.selection.selectionRect;
    this.nodes.list.forEach((node) => {
      if (isInsideRect(node.position, rect)) {
        selection.set(node.id, { id: node.id, type: "node" });
        node.segmentIds.forEach((segmentId) => {
          selection.set(segmentId, { id: segmentId, type: "segment" });
        });
      }
    });

    this.fixtures.list.forEach((fixture) => {
      if (isRectIntersection(fixture.rect, rect)) {
        selection.set(fixture.id, { id: fixture.id, type: "fixture" });
      }
    });

    if (selection.size > 0) {
      this.selection.updateSelection([...selection.values()]);
    }
  }

  moveSelection(delta: Position) {
    if (Array.isArray(this.selection.selected)) {
      const items = this.selection.selected;
      items.forEach((item) => {
        switch (item.type) {
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
      this.selection.moveSelectionBy(delta);
    } else {
      console.warn(`Can't call moveBy for single selection`);
    }
  }

  empty() {
    this.nodes.clear();
    this.segments.clear();
    this.selection.reset();
  }

  constructor(
    selection: SelectionStore,
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
