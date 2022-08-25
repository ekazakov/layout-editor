import { makeAutoObservable } from "mobx";
import { Intersection, LineSegment, Position } from "../types";
import { RoadNode } from "./road-node";
import * as nh from "./utils/node-helpers";
import { Fixture } from "./fixture";
import { RoadSegment } from "./road-segment";
import * as sh from "./utils/segment-helpers";
import * as fh from "./utils/fixture-helpers";
import { SelectionStore } from "./selection";

export class NodeStore {
  private segments: SegmentStore = null!;
  private nodes: Map<string, RoadNode> = new Map<string, RoadNode>();
  private set = (id: string, node: RoadNode) => this.nodes.set(id, node);

  add = (p: Position) => {
    const node = new RoadNode(p);
    this.nodes.set(node.id, node);
    return node;
  };

  get = (id: string): RoadNode | undefined => this.nodes.get(id);

  has = (id: string): boolean => this.nodes.has(id);

  delete = (id: string) => this.nodes.delete(id);

  isConnected = (aId: string, bId: string) => nh.isConnected(this.nodes, this.segments, aId, bId);

  constructor() {
    makeAutoObservable(this);
  }

  get list() {
    return [...this.nodes.values()];
  }

  clear() {
    this.nodes.clear();
  }

  setSegments(segments: SegmentStore) {
    this.segments = segments;
  }
}

export class SegmentStore {
  private segments: Map<string, RoadSegment> = new Map<string, RoadSegment>();
  private nodes: NodeStore = null!;
  private fixtures: FixturesStore = null!;
  private selection: SelectionStore = null!;
  private intersections: Intersection[] = [];

  private _addSegment = (startNodeId: string, endNodeId: string) =>
    sh.addSegmentInternal(this.nodes, this.segments, startNodeId, endNodeId);

  addSegment(startId: string, endId: string) {
    sh.addSegment(
      this.nodes,
      this.segments,
      this.fixtures,
      this.selection,
      this.intersections,
      startId,
      endId,
    );
  }

  joinNodes(startNodeId: string, endNodeId: string) {
    this._addSegment(startNodeId, endNodeId);
  }

  deleteSegment = (id: string) =>
    sh.deleteSegment(this.nodes, this.segments, this.fixtures, this.selection, id);

  updateIntersectionsWithRoad(line: LineSegment) {
    this.intersections = sh.updateIntersectionsWithRoad(this.segments, line);
  }

  splitSegmentAt = (id: string, p: Position) =>
    sh.splitSegmentAt(this.nodes, this.segments, this.fixtures, this.selection, id, p);

  get = (id: string) => this.segments.get(id);

  get list() {
    return [...this.segments.values()];
  }

  clear() {
    this.segments.clear();
  }

  setNodes(nodes: NodeStore) {
    this.nodes = nodes;
  }

  setFixtures(fixtures: FixturesStore) {
    this.fixtures = fixtures;
  }

  setSelection(selection: SelectionStore) {
    this.selection = selection;
  }
}

export class FixturesStore {
  private fixtures: Map<string, Fixture> = new Map<string, Fixture>();
  private selection: SelectionStore = null!;

  getFixture = (id: string) => this.fixtures.get(id);

  deleteFixture = (fixtureId: string) => fh.deleteFixture(this.fixtures, this.selection, fixtureId);

  getGate(id: string) {
    return this.list.find((fixture) => fixture.getGate(id))?.getGate(id);
  }

  get list() {
    return [...this.fixtures.values()];
  }

  get gates() {
    return this.list.flatMap((fixture) => fixture.gateList);
  }

  clear() {
    this.fixtures.clear();
  }

  setSelection(selection: SelectionStore) {
    this.selection = selection;
  }
}
