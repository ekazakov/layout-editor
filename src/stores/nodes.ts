import { makeAutoObservable, reaction } from "mobx";
import { Intersection, LineSegment, Position } from "../types";
import { RoadNode } from "./road-node";
import * as nh from "./utils/node-helpers";
import { Fixture } from "./fixture";
import { RoadSegment } from "./road-segment";
import * as sh from "./utils/segment-helpers";
import * as fh from "./utils/fixture-helpers";
import { SelectionStore } from "./selection";
import { magnitude, projectionPoint } from "../utils/line";
import { CursorStore } from "./cursor";

function getMinIndex(arr: any[]) {
  let minIndex = 0;

  for (let i = 1; i < arr.length; i++) {
    if (arr[minIndex] > arr[i]) {
      minIndex = i;
    }
  }

  return minIndex;
}

export class NodeStore {
  private segments: SegmentStore = null!;
  private fixtures: FixturesStore = null!;
  private selection: SelectionStore = null!;
  private readonly nodes: Map<string, RoadNode> = new Map<string, RoadNode>();

  set = (id: string, node: RoadNode) => this.nodes.set(id, node);

  add = (p: Position) => {
    const node = new RoadNode(p);
    this.nodes.set(node.id, node);
    return node;
  };

  addNode = (p: Position) => this.add(p);

  get = (id: string): RoadNode | undefined => this.nodes.get(id);

  has = (id: string): boolean => this.nodes.has(id);

  _delete = (id: string) => this.nodes.delete(id);

  deleteNode = (id: string) =>
    nh.deleteNode(this, this.segments, this.fixtures, this.selection, id);

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

  setFixtures(fixtures: FixturesStore) {
    this.fixtures = fixtures;
  }

  setSelection(selection: SelectionStore) {
    this.selection = selection;
  }
}

export class SegmentStore {
  private segments: Map<string, RoadSegment> = new Map<string, RoadSegment>();
  private nodes: NodeStore = null!;
  private fixtures: FixturesStore = null!;
  private selection: SelectionStore = null!;
  private cursor: CursorStore = null!;
  private intersections: Intersection[] = [];
  private snapPoints: [Position, string][] = [];

  private _addSegment = (startNodeId: string, endNodeId: string) =>
    sh.addSegmentInternal(this.nodes, this, startNodeId, endNodeId);

  set = (id: string, segment: RoadSegment) => this.segments.set(id, segment);

  addSegment(startId: string, endId: string) {
    sh.addSegment(
      this.nodes,
      this,
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

  _delete = (id: string) => this.segments.delete(id);

  deleteSegment = (id: string) =>
    sh.deleteSegment(this.nodes, this, this.fixtures, this.selection, id);

  updateSnapPoints(p: Position) {
    this.snapPoints = [];
    this.segments.forEach((segment) => {
      this.snapPoints.push([projectionPoint(p, segment), segment.id]);
    });

    const distances = this.snapPoints.map(([point]) => {
      return magnitude(point, this.cursor.position);
    });

    const minIndex = getMinIndex(distances);

    if (distances.length === 0 || distances[minIndex] >= 20) {
      // console.log("Reset snapping");
      this.cursor.resetSanpping();
      return;
    }

    this.cursor.setSnapPosition(this.snapPoints[minIndex][0]);
  }

  updateIntersectionsWithRoad(line: LineSegment) {
    this.intersections = sh.updateIntersectionsWithRoad(this.segments, line);
  }

  splitSegmentAt = (id: string, p: Position) =>
    sh.splitSegmentAt(this.nodes, this, this.fixtures, this.selection, id, p);

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
    reaction(
      () => this.selection.nodeId,
      (newSelectedNodeId: string) => {
        if (!newSelectedNodeId) {
          this.intersections = [];
        }
      },
    );
  }

  setCursor(cursor: CursorStore) {
    this.cursor = cursor;
  }

  constructor() {
    makeAutoObservable(this);
  }
}

export class FixturesStore {
  private fixtures: Map<string, Fixture> = new Map<string, Fixture>();
  private nodes: NodeStore = null!;
  private selection: SelectionStore = null!;
  private cursor: CursorStore = null!;

  set = (id: string, fixture: Fixture) => this.fixtures.set(id, fixture);

  getFixture = (id: string) => this.fixtures.get(id);

  deleteFixture = (fixtureId: string) => fh.deleteFixture(this.fixtures, this.selection, fixtureId);

  getGate(id: string) {
    return this.list.find((fixture) => fixture.getGate(id))?.getGate(id);
  }

  connectToGate = (gateId: string, node: RoadNode) => fh.connectToGate(this.list, gateId, node);

  updateSnapGates() {
    const node = this.nodes.get(this.selection.nodeId);
    if (!node) {
      return;
    }

    if (node.gateId) {
      return;
    }

    const distances = this.gates.map((gate) => {
      return magnitude(gate, node);
    });

    const minIndex = getMinIndex(distances);

    if (distances.length === 0 || distances[minIndex] >= 30) {
      this.cursor.resetSanpping();
      return;
    }

    const gate = this.gates[minIndex];
    this.cursor.setSnapPosition(gate);
    this.connectToGate(gate.id, node);
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

  setCursor(cursor: CursorStore) {
    this.cursor = cursor;
  }

  setNodes(nodes: NodeStore) {
    this.nodes = nodes;
  }
}
