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

  // removeNode = (id: string) => {
  //   this.nodes.delete(id);
  // };

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
        this.segments.delete(segmentId);
      }
    }

    if (this.selectedNodeId === nodeId) {
      this.selectedNodeId = "";
    }
    this.nodes.delete(nodeId);
    return true;
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

  constructor() {
    makeAutoObservable(this);
  }
}
