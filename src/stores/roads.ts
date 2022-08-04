import { makeAutoObservable, reaction, toJS } from "mobx";
import { LineSegment, Position, Intersection } from "../types";
import { RoadNode } from "./road-node";
import { RoadSegment } from "./road-segment";
import { SelectionStore } from "./selection";
import { hasCommonPoint, segmentIntersection } from "../utils/line";

export class RoadsStore {
  nodes: Map<string, RoadNode> = new Map<string, RoadNode>();
  segments: Map<string, RoadSegment> = new Map<string, RoadSegment>();

  private selection: SelectionStore;

  private intersections: Intersection[] = [];

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

    if (nodeId) {
      // this.getNode(nodeId)!.selected = false;

      if (nodeId === id) {
        // this.selectedNodeId = "";
        return;
      }

      // this.selectedNodeId = "";
    }

    // node.selected = true;
    this.selection.nodeId = id;
  };

  toggleSegmentSelection = (id: string) => {
    const segment = this.segments.get(id);
    if (!segment) {
      throw new Error(`Segment ${id} doesn't exist`);
    }

    const { segmentId } = this.selection;
    this.selection.reset();

    if (segmentId) {
      // this.getSegment(segmentId)!.selected = false;

      if (segmentId === id) {
        // this.selectedSegmentId = "";
        return;
      }

      // this.selection.reset();
      // this.selectedSegmentId = "";
    }

    // segment.selected = true;
    // this.selectedSegmentId = id;
    this.selection.segmentId = id;
  };

  // private resetSelectedNode() {
  //   if (this.selection.nodeId) {
  //     // this.getNode(this.selection.nodeId)!.selected = false;
  //   }
  //   this.selection.reset();
  // }

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

    return this.nodes.delete(nodeId);
  }

  deleteSegment(id: string) {
    if (this.selection.segmentId === id) {
      // this.selectedSegmentId = "";
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
  }

  addSegment(startId: string, endId: string) {
    const nodes = [endId];
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

  toJSON() {
    return {
      nodes: toJS(
        [...this.nodes.entries()].map(([key, value]) => [key, value.toJSON()])
      ),
      segments: toJS(
        [...this.segments.entries()].map(([key, value]) => [
          key,
          value.toJSON()
        ])
      )
    };
  }
}
