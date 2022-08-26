import { makeAutoObservable } from "mobx";
import { Position } from "../types";
import { RoadNode } from "./road-node";
import * as nh from "./utils/node-helpers";
import { SelectionStore } from "./selection";
import { SegmentStore } from "./segments";
import { FixturesStore } from "./fixtures";

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
