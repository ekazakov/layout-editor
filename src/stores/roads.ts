import { makeAutoObservable, reaction, toJS } from "mobx";
import { LineSegment, Position, Intersection, RoadsDump } from "../types";
import { RoadNode } from "./road-node";
import { RoadSegment } from "./road-segment";
import { Fixture, Gate } from "./fixture";
import { SelectionStore } from "./selection";
import { projectionPoint, magnitude } from "../utils/line";
import * as nh from "./utils/node-helpers";
import * as sh from "./utils/segment-helpers";
import * as fh from "./utils/fixture-helpers";
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

export class RoadsStore {
  nodes: Map<string, RoadNode> = new Map<string, RoadNode>();
  segments: Map<string, RoadSegment> = new Map<string, RoadSegment>();
  fixtures: Map<string, Fixture> = new Map<string, Fixture>();

  private selection: SelectionStore;

  private cursor: CursorStore;

  private intersections: Intersection[] = [];

  private snapPoints: [Position, string][] = [];

  private snapGates: Gate[] = [];

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
  }

  addNode = (p: Position) => nh.addNode(this.nodes, p);

  private _addSegment = (startNodeId: string, endNodeId: string) =>
    sh.addSegmentInternal(this.nodes, this.segments, startNodeId, endNodeId);

  joinNodes(startNodeId: string, endNodeId: string) {
    this._addSegment(startNodeId, endNodeId);
  }

  addSegmentToPosition(startNodeId: string, p: Position) {
    sh.addSegmentToPosition(this.nodes, this.segments, startNodeId, p);
  }

  isConnected = (aId: string, bId: string) =>
    nh.isConnected(this.nodes, this.segments, aId, bId);

  toggleNodeSelection = (id: string) =>
    nh.toggleNodeSelection(this.nodes, this.selection, id);

  toggleSegmentSelection = (id: string) =>
    sh.toggleSegmentSelection(this.segments, this.selection, id);

  toggleFixtureSelection = (id: string) =>
    fh.toggleFixtureSelection(this.fixtures, this.selection, id);

  toggleGateSelection(id: string) {
    fh.toggleGateSelection(this.fixtureList, this.selection, id);
  }

  deleteNode = (nodeId: string) =>
    // prettier-ignore
    nh.deleteNode(this.nodes, this.segments, this.fixtureList, this.selection, nodeId);

  deleteSegment = (id: string) =>
    sh.deleteSegment(this.nodes, this.segments, this.selection, id);

  deleteSelectedNode = () => this.deleteNode(this.selection.nodeId);

  getNode = (id: string): RoadNode | undefined => this.nodes.get(id);

  getSegment = (id: string) => this.segments.get(id);

  getFixture = (id: string) => this.fixtures.get(id);

  getGate(id: string) {
    return this.fixtureList.find((fixtue) => fixtue.getGate(id))?.getGate(id);
  }

  get selectedSegment() {
    return this.getSegment(this.selection.segmentId || "");
  }

  get selectedNode() {
    return this.getNode(this.selection.nodeId || "");
  }

  get selectedFixture() {
    return this.getFixture(this.selection.fixtureId || "");
  }

  get selectedGate() {
    return this.getGate(this.selection.gateId || "");
  }

  deleteSelectedSegment() {
    return this.deleteSegment(this.selection.segmentId);
  }

  splitSegmentAt = (id: string, p: Position) =>
    sh.splitSegmentAt(this.nodes, this.segments, this.selection, id, p);

  updateIntersectionsWithRoad(line: LineSegment) {
    this.intersections = sh.updateIntersectionsWithRoad(this.segments, line);
  }

  addSegment(startId: string, endId: string) {
    sh.addSegment(
      this.nodes,
      this.segments,
      this.selection,
      this.intersections,
      startId,
      endId
    );
  }

  get fixtureList() {
    return [...this.fixtures.values()];
  }

  get gateList() {
    return this.fixtureList.flatMap((fixtue) => fixtue.gateList);
  }

  connectToGate = (gateId: string, node: RoadNode) =>
    fh.connectToGate(this.fixtureList, gateId, node);

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

  updateSnapGates() {
    this.snapGates = [];

    if (!this.selectedNode) {
      return;
    }

    const node = this.selectedNode;

    if (node.gateId) {
      return;
    }

    const distances = this.gateList.map((gate) => {
      return magnitude(gate, node);
    });

    const minIndex = getMinIndex(distances);

    if (distances.length === 0 || distances[minIndex] >= 30) {
      this.cursor.resetSanpping();
      return;
    }

    // console.log("updateSnapGates");
    const gate = this.gateList[minIndex];
    this.cursor.setSnapPosition(gate);
    this.connectToGate(gate.id, node);
  }

  empty() {
    this.nodes.clear();
    this.segments.clear();
    this.selection.reset();
  }

  constructor(selection: SelectionStore, cursor: CursorStore) {
    makeAutoObservable(this);
    this.selection = selection;
    this.cursor = cursor;

    reaction(
      () => this.selection.nodeId,
      (newSelectedNodeId: string) => {
        if (!newSelectedNodeId) {
          this.intersections = [];
        }
      }
    );
  }

  initFixrures() {
    const f1 = new Fixture({ x: 100, y: 100 });
    const f2 = new Fixture({ x: 700, y: 700 });
    this.fixtures.set(f1.id, f1);
    this.fixtures.set(f2.id, f2);
  }

  get nodeList() {
    return [...this.nodes.values()];
  }

  get segmentList() {
    return [...this.segments.values()];
  }

  toJSON() {
    return {
      nodes: this.nodeList.map((value) => value.toJSON()),
      segments: this.segmentList.map((value) => value.toJSON())
    } as RoadsDump;
  }
}
