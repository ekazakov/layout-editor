import { makeAutoObservable } from "mobx";
import { nanoid } from "nanoid";
import { Position } from "../types";

export class RoadNode {
  private _position: Position = { x: 0, y: 0 };
  private _selected = false;
  public readonly id: string;

  segmentIds: Set<string> = new Set<string>();

  setPostion = (p: Position) => {
    this._position = p;
  };

  moveBy = (delta: Position) => {
    this._position = {
      x: this._position.x + delta.x,
      y: this._position.y + delta.y
    };
  };

  get position() {
    return this._position;
  }

  get selected() {
    return this._selected;
  }

  toggleSelection = () => {
    this._selected = !this._selected;
  };

  set selected(selected) {
    this._selected = selected;
  }

  constructor(p: Position, id?: string) {
    makeAutoObservable(this);
    this._position = p;
    this.id = id ?? nanoid(9);
  }
}

export class RoadSegment {
  public readonly id: string;
  private _selected = false;
  private _p1: RoadNode;
  private _p2: RoadNode;

  nodeStartId: string = "";
  nodeEndId: string = "";

  set selected(selected: boolean) {
    this._selected = selected;
  }

  get selected() {
    return this._selected;
  }

  get start() {
    return this._p1.position;
  }

  get end() {
    return this._p2.position;
  }

  moveBy = (delta: Position) => {
    this._p1.moveBy(delta);
    this._p2.moveBy(delta);
  };

  constructor(nodeStart: RoadNode, nodeEnd: RoadNode, id?: string) {
    makeAutoObservable(this);
    this.id = id ?? nanoid(9);
    this.nodeStartId = nodeStart.id;
    this.nodeEndId = nodeEnd.id;
    this._p1 = nodeStart;
    this._p2 = nodeEnd;
  }
}

export class NodesStore {
  nodes: Map<string, RoadNode> = new Map<string, RoadNode>();
  segments: Map<string, RoadSegment> = new Map<string, RoadSegment>();

  private selectedNodeId: string = "";

  private selectedSegmentId: string = "";

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

  constructor() {
    makeAutoObservable(this);
  }
}
