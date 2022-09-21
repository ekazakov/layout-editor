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

  set = (id: string, segment: RoadSegment) => this.segments.set(id, segment);

  get intersections() {
    return this._intersections;
  }

  get snapPoints() {
    return this._snapPoints;
  }

  addSegment(startId: string, endId: string) {
    const line = {
      start: this.nodes.getNode(startId)!,
      end: this.nodes.getNode(endId)!,
    };
    this.updateIntersectionsWithRoad(line);
    sh.addSegment(
      this.nodes,
      this,
      this.fixtures,
      this._intersections,
      startId,
      endId,
    );
    this._intersections = [];
  }

  _delete = (id: string) => this.segments.delete(id);

  deleteSegment = (id: string) => sh.deleteSegment(this.nodes, this, this.fixtures, id);

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
    sh.splitSegmentAt(this.nodes, this, this.fixtures, id, p);

  getSegment = (id: string) => this.segments.get(id);

  has = (id: string) => this.segments.has(id);

  get list() {
    return [...this.segments.values()];
  }

  get count() {
    return this.segments.size;
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

    // TODO: extract work with intersections to separate store
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
