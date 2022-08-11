import { makeAutoObservable, reaction, toJS } from "mobx";
import { LineSegment, Position, Intersection, RoadsDump } from "../types";
import { RoadNode } from "./road-node";
import { RoadSegment } from "./road-segment";
import { Fixture } from "./fixture";
import { SelectionStore } from "./selection";
import { hasCommonPoint, segmentIntersection } from "../utils/line";

export class RoadsStore {
  nodes: Map<string, RoadNode> = new Map<string, RoadNode>();
  segments: Map<string, RoadSegment> = new Map<string, RoadSegment>();
  fixtures: Map<string, Fixture> = new Map<string, Fixture>();

  private selection: SelectionStore;

  private intersections: Intersection[] = [];

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

  addNode = (p: Position) => {
    const node = new RoadNode(p);
    this.nodes.set(node.id, node);
    return node;
  };

  private _addSegment(startNodeId: string, endNodeId: string) {
    const startNode = this.getNode(startNodeId);
    if (!startNode) {
      throw new Error(`Node with id: ${startNodeId} doesn't exist`);
    }
    const endNode = this.getNode(endNodeId);
    if (!endNode) {
      throw new Error(`Node with id: ${endNodeId} doesn't exist`);
    }

    const segment = new RoadSegment(startNode, endNode);

    endNode.segmentIds.add(segment.id);
    startNode.segmentIds.add(segment.id);
    this.segments.set(segment.id, segment);

    return segment;
  }

  joinNodes(startNodeId: string, endNodeId: string) {
    this._addSegment(startNodeId, endNodeId);
  }

  addSegmentToPosition(startNodeId: string, p: Position) {
    const startNode = this.getNode(startNodeId);
    if (!startNode) {
      throw new Error(`Node with id: ${startNodeId} doesn't exist`);
    }
    const endNode = this.addNode(p);
    const segment = new RoadSegment(startNode, endNode);

    endNode.segmentIds.add(segment.id);
    startNode.segmentIds.add(segment.id);
    this.segments.set(segment.id, segment);
  }

  isConnected(aId: string, bId: string) {
    const node = this.getNode(aId);
    if (node) {
      for (const segmentId of node.segmentIds) {
        const segment = this.getSegment(segmentId)!;
        if (segment.start.id === bId || segment.end.id === bId) {
          return true;
        }
      }
    }
    return false;
  }

  toggleNodeSelection = (id: string) => {
    const node = this.nodes.get(id);
    if (!node) {
      throw new Error(`Node ${id} doesn't exist`);
    }

    const { nodeId } = this.selection;

    this.selection.reset();

    if (nodeId === id) {
      return;
    }

    this.selection.nodeId = id;
  };

  toggleSegmentSelection = (id: string) => {
    const segment = this.segments.get(id);
    if (!segment) {
      throw new Error(`Segment ${id} doesn't exist`);
    }

    const { segmentId } = this.selection;
    this.selection.reset();

    if (segmentId === id) {
      return;
    }

    this.selection.segmentId = id;
  };

  toggleFixtureSelection(id: string) {
    const fixture = this.fixtures.get(id);
    if (!fixture) {
      throw new Error(`Fixture ${id} doesn't exist`);
    }

    const { fixtureId } = this.selection;
    this.selection.reset();

    if (fixtureId === id) {
      return;
    }

    this.selection.fixtureId = id;
  }

  deleteNode(nodeId: string) {
    const node = this.getNode(nodeId);
    if (!node) {
      return false;
    }

    if (node.segmentIds.size > 0) {
      for (const segmentId of node.segmentIds) {
        this.deleteSegment(segmentId);
      }
    }

    if (this.selection.nodeId === nodeId) {
      this.selection.reset();
    }

    if (node.gateId) {
      const gate = this.getGate(node.gateId);

      gate?.disconnect();
    }

    return this.nodes.delete(nodeId);
  }

  deleteSegment(id: string) {
    if (this.selection.segmentId === id) {
      this.selection.reset();
    }
    const segment = this.getSegment(id);
    if (segment) {
      const nodeStart = this.nodes.get(segment.start.id);
      nodeStart?.segmentIds.delete(id);
      const nodeEnd = this.nodes.get(segment.end.id);
      nodeEnd?.segmentIds.delete(id);
    }
    return this.segments.delete(id);
  }

  deleteSelectedNode() {
    return this.deleteNode(this.selection.nodeId);
  }

  getNode = (id: string): RoadNode | undefined => {
    return this.nodes.get(id);
  };

  get selectedNode() {
    return this.getNode(this.selection.nodeId || "");
  }

  getSegment(id: string) {
    return this.segments.get(id);
  }

  get selectedSegment() {
    return this.getSegment(this.selection.segmentId || "");
  }

  deleteSelectedSegment() {
    return this.deleteSegment(this.selection.segmentId);
  }

  splitSegmentAt(id: string, p: Position) {
    const segment = this.getSegment(id);
    if (!segment) {
      throw new Error(`Segment ${id} doesn't exist`);
    }

    const newNode = this.addNode(p);

    this._addSegment(segment.start.id, newNode.id);
    this._addSegment(newNode.id, segment.end.id);

    this.deleteSegment(id);
  }

  updateIntersectionsWithRoad(line: LineSegment) {
    this.intersections = [];

    this.segments.forEach((segment) => {
      if (hasCommonPoint(segment, line)) {
        return;
      }

      const point = segmentIntersection(line, segment);

      if (!point) {
        return;
      }

      this.intersections.push({ segmentId: segment.id, point });
    });
    // console.log("Ints:", toJS(this.intersections));
  }

  addSegment(startId: string, endId: string) {
    if (startId === endId) {
      console.log(`Tring to connect node ${startId} to itself`);
      return;
    }
    const nodes = [endId];
    // console.log("Ints final:", toJS(this.intersections));
    for (const int of this.intersections) {
      const segment = this.getSegment(int.segmentId);
      if (!segment) {
        throw new Error(`Segment ${int.segmentId} doesn't exist`);
      }

      const newNode = this.addNode(int.point);
      nodes.push(newNode.id);
      this._addSegment(segment.start.id, newNode.id);
      this._addSegment(newNode.id, segment.end.id);

      this.deleteSegment(int.segmentId);
    }

    nodes.push(startId);

    for (let i = 0; i < nodes.length - 1; i++) {
      this._addSegment(nodes[i], nodes[i + 1]);
    }
  }

  get fixtureList() {
    return [...this.fixtures.values()];
  }

  connectToGate(gateId: string, node: RoadNode) {
    const gate = this.getGate(gateId);
    if (!gate) {
      console.error(`Gate ${gateId} doesn't exist`);
      return;
    }
    gate.connect(node);
  }

  getGate(id: string) {
    return this.fixtureList
      .find((fixtue) => fixtue.getGate(id) !== null)
      ?.getGate(id);
  }

  empty() {
    this.nodes.clear();
    this.segments.clear();
    this.selection.reset();
  }

  constructor(selection: SelectionStore) {
    this.selection = selection;

    makeAutoObservable(this);

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
