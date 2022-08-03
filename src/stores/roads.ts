import { makeAutoObservable, reaction, toJS } from "mobx";
import { LineSegment, Position } from "../types";
import { RoadNode } from "./road-node";
import { RoadSegment } from "./road-segment";
import { hasCommonPoint, segmentIntersection } from "../utils/line";

interface Intersection {
  segmentId: string;
  point: Position;
}

export class NodesStore {
  nodes: Map<string, RoadNode> = new Map<string, RoadNode>();
  segments: Map<string, RoadSegment> = new Map<string, RoadSegment>();

  private selectedNodeId: string = "";

  private selectedSegmentId: string = "";

  intersections: Intersection[] = [];

  addNode = (p: Position) => {
    const node = new RoadNode(p);
    this.nodes.set(node.id, node);
    return node;
  };

  addSegment(startNodeId: string, endNodeId: string) {
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
        if (segment.nodeStartId === bId || segment.nodeEndId === bId) {
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

    if (this.selectedNodeId) {
      this.getNode(this.selectedNodeId)!.selected = false;

      if (this.selectedNodeId === id) {
        this.selectedNodeId = "";
        return;
      }

      this.selectedNodeId = "";
    }

    node.selected = true;
    this.selectedNodeId = id;
  };

  resetSelectedNode() {
    if (this.selectedNodeId) {
      this.getNode(this.selectedNodeId)!.selected = false;
    }
    this.selectedNodeId = "";
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

    if (this.selectedNodeId === nodeId) {
      this.selectedNodeId = "";
    }
    this.nodes.delete(nodeId);
    return true;
  }

  deleteSegment(id: string) {
    if (this.selectedSegmentId === id) {
      this.selectedSegmentId = "";
    }
    const segment = this.getSegment(id);
    if (segment) {
      const nodeStart = this.nodes.get(segment.nodeStartId);
      nodeStart?.segmentIds.delete(id);
      const nodeEnd = this.nodes.get(segment.nodeEndId);
      nodeEnd?.segmentIds.delete(id);
    }
    return this.segments.delete(id);
  }

  deleteSelectedNode() {
    return this.deleteNode(this.selectedNodeId);
  }

  getNode = (id: string): RoadNode | undefined => {
    return this.nodes.get(id);
  };

  get selectedNode() {
    return this.getNode(this.selectedNodeId || "");
  }

  toggleSegmentSelection = (id: string) => {
    const segment = this.segments.get(id);
    if (!segment) {
      throw new Error(`Segment ${id} doesn't exist`);
    }

    if (this.selectedSegmentId) {
      this.getSegment(this.selectedSegmentId)!.selected = false;

      if (this.selectedSegmentId === id) {
        this.selectedSegmentId = "";
        return;
      }

      this.selectedSegmentId = "";
    }

    segment.selected = true;
    this.selectedSegmentId = id;
  };

  getSegment(id: string) {
    return this.segments.get(id);
  }

  get selectedSegment() {
    return this.getSegment(this.selectedSegmentId || "");
  }

  deleteSelectedSegment() {
    return this.deleteSegment(this.selectedSegmentId);
  }

  splitSegmentAt(id: string, p: Position) {
    const segment = this.getSegment(id);
    if (!segment) {
      throw new Error(`Segment ${id} doesn't exist`);
    }

    const newNode = this.addNode(p);

    this.addSegment(segment.nodeStartId, newNode.id);
    this.addSegment(newNode.id, segment.nodeEndId);

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

    // if (this.intersections.length) {
    //   this.intersections.push
    // }

    // console.log(toJS(this.intersections));
  }

  createSegmentsFromIntersections(startId: string, endId: string) {
    // const startNode = this.getNode(startId)!;
    const nodes = [startId];
    for (const int of this.intersections) {
      const segment = this.getSegment(int.segmentId);
      if (!segment) {
        throw new Error(`Segment ${int.segmentId} doesn't exist`);
      }

      const newNode = this.addNode(int.point);
      nodes.push(newNode.id);
      this.addSegment(segment.nodeStartId, newNode.id);
      this.addSegment(newNode.id, segment.nodeEndId);

      this.deleteSegment(int.segmentId);
    }

    nodes.push(endId);
    console.log("join");
    for (let i = 0; i < nodes.length - 1; i++) {
      console.log("join:", nodes[i], nodes[i + 1]);
      this.addSegment(nodes[i], nodes[i + 1]);
    }
    // nodes.unshift(startNode)

    // while (this.intersections.length) {
    //   const intersection = this.intersections.pop();
    //   if (intersection) {
    //     const { segmentId, point } = intersection;
    //     this.splitSegmentAt(segmentId, point);
    //   }
    // }
  }

  constructor() {
    makeAutoObservable(this);

    reaction(
      () => this.selectedNodeId,
      (newSelectedNodeId: string) => {
        if (!newSelectedNodeId) {
          this.intersections = [];
        }
      }
    );
  }
}
