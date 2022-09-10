import { RoadSegment } from "./road-segment";
import { CursorStore } from "./cursor";
import { Intersection, LineSegment, Position } from "../types";
import * as sh from "./utils/segment-helpers";
import { magnitude, projectionPoint } from "../utils/line";
import { makeAutoObservable, reaction } from "mobx";
import { NodeStore } from "./nodes";
import { FixturesStore } from "./fixtures";
import { SelectionManagerStore } from "./selection/selection-manager";

function getMinIndex(arr: any[]) {
  let minIndex = 0;

  for (let i = 1; i < arr.length; i++) {
    if (arr[minIndex] > arr[i]) {
      minIndex = i;
    }
  }

  return minIndex;
}

export class SegmentStore {
  private segments: Map<string, RoadSegment> = new Map<string, RoadSegment>();
  private fixtures: FixturesStore = null!;
  private nodes: NodeStore = null!;
  private selection: SelectionManagerStore = null!;
  private cursor: CursorStore = null!;
  private _intersections: Intersection[] = [];
  private _snapPoints: [Position, string][] = [];

  private _addSegment = (startNodeId: string, endNodeId: string) =>
    sh.addSegmentInternal(this.nodes, this, startNodeId, endNodeId);

  set = (id: string, segment: RoadSegment) => this.segments.set(id, segment);

  get intersections() {
    return this._intersections;
  }

  get snapPoints() {
    return this._snapPoints;
  }

  addSegment(startId: string, endId: string) {
    sh.addSegment(
      this.nodes,
      this,
      this.fixtures,
      this.selection,
      this._intersections,
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
    this._snapPoints = [];
    this.segments.forEach((segment) => {
      this._snapPoints.push([projectionPoint(p, segment), segment.id]);
    });

    const distances = this.snapPoints.map(([point]) => {
      return magnitude(point, this.cursor.position);
    });

    const minIndex = getMinIndex(distances);

    if (distances.length === 0 || distances[minIndex] >= 20) {
      this.cursor.resetSnapping();
      return;
    }

    this.cursor.setSnapPosition(this.snapPoints[minIndex][0]);
  }

  updateIntersectionsWithRoad(line: LineSegment) {
    this._intersections = sh.updateIntersectionsWithRoad(this.segments, line);
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

  setSelection(selection: SelectionManagerStore) {
    this.selection = selection;
    reaction(
      () => {
        return this.selection.getSingleSelection("node");
      },
      (newSelectedNodeId: string | undefined) => {
        if (!newSelectedNodeId) {
          this._intersections = [];
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
