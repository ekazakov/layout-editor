import { hasCommonPoint, segmentIntersection } from "../../utils/line";
import { LineSegment, Position, Intersection } from "../../types";
import { RoadSegment } from "../road-segment";
import * as nh from "./node-helpers";
import { NodeStore } from "../nodes";
import { SegmentStore } from "../segments";
import { FixturesStore } from "../fixtures";
import { getDistance } from "../../utils/get-distance";
import { RoadNode } from "../road-node";

export function deleteSegment(
  nodes: NodeStore,
  segments: SegmentStore,
  fixtures: FixturesStore,
  id: string,
) {
  const segment = segments.getSegment(id);

  segments._delete(id);
  if (segment) {
    const nodeStart = nodes.getNode(segment.start.id);

    nodeStart?.segmentIds.delete(id);
    if (nodeStart?.segmentIds.size === 0) {
      nh.deleteNode(nodes, segments, fixtures, nodeStart.id);
    }
    const nodeEnd = nodes.getNode(segment.end.id);
    nodeEnd?.segmentIds.delete(id);
    if (nodeEnd?.segmentIds.size === 0) {
      nh.deleteNode(nodes, segments, fixtures, nodeEnd.id);
    }
  }
}

export function addSegmentInternal(
  nodes: NodeStore,
  segments: SegmentStore,
  startNodeId: string,
  endNodeId: string,
) {
  const startNode = nh.getNode(nodes, startNodeId);
  if (!startNode) {
    throw new Error(`Node with id: ${startNodeId} doesn't exist`);
  }
  const endNode = nh.getNode(nodes, endNodeId);
  if (!endNode) {
    throw new Error(`Node with id: ${endNodeId} doesn't exist`);
  }

  const segment = new RoadSegment(startNode, endNode);

  endNode.segmentIds.add(segment.id);
  startNode.segmentIds.add(segment.id);
  segments.set(segment.id, segment);

  return segment;
}

export function splitSegmentAt(
  nodes: NodeStore,
  segments: SegmentStore,
  fixtures: FixturesStore,
  id: string,
  p: Position,
) {
  const segment = segments.getSegment(id);

  if (!segment) {
    throw new Error(`Segment ${id} doesn't exist`);
  }

  const newNode = nodes.createNoe(p);
  addSegmentInternal(nodes, segments, segment.start.id, newNode.id);
  addSegmentInternal(nodes, segments, newNode.id, segment.end.id);
  deleteSegment(nodes, segments, fixtures, id);
  return newNode;
}

function ascComparator(int1: Intersection, int2: Intersection) {
  const { point: p1 } = int1;
  const { point: p2 } = int2;

  if (p1.x === p2.x) {
    return p1.y - p2.y;
  }

  return p1.x - p2.x;
}

function descComparator(int1: Intersection, int2: Intersection) {
  const { point: p1 } = int1;
  const { point: p2 } = int2;

  if (p1.x === p2.x) {
    return p2.y - p1.y;
  }

  return p2.x - p1.x;
}

function isDesc(line: LineSegment) {
  const { start: s, end: e } = line;
  if (s.x === e.x) {
    return s.y > e.y;
  }

  return s.x > e.x;
}

export function updateIntersectionsWithRoad(segments: Map<string, RoadSegment>, line: LineSegment) {
  const intersections: Intersection[] = [];

  segments.forEach((segment) => {
    if (hasCommonPoint(segment, line)) {
      return;
    }

    const point = segmentIntersection(line, segment);

    if (!point) {
      return;
    }

    intersections.push({ segmentId: segment.id, point });
  });

  const comparator = isDesc(line) ? descComparator : ascComparator;

  intersections.sort(comparator);

  return intersections;
}

export function addSegment(
  nodes: NodeStore,
  segments: SegmentStore,
  fixtures: FixturesStore,
  intersections: Intersection[],
  startId: string,
  endId: string,
) {
  if (startId === endId) {
    console.log(`Trying to connect node ${startId} to itself`);
    return;
  }
  const nodesToJoin = [startId];
  const endNode = nodes.getNode(endId);

  if (!endNode) {
    throw new Error(`Node ${endId} doesn't exists`);
  }

  for (const int of intersections) {
    const segment = segments.getSegment(int.segmentId);
    if (!segment) {
      throw new Error(`Segment ${int.segmentId} doesn't exist`);
    }

    const newNode = new RoadNode(int.point);

    if (getDistance(newNode, endNode) <= 1) {
      continue;
    }
    nodes.addNode(newNode);
    nodesToJoin.push(newNode.id);

    addSegmentInternal(nodes, segments, segment.start.id, newNode.id);
    addSegmentInternal(nodes, segments, newNode.id, segment.end.id);

    deleteSegment(nodes, segments, fixtures, int.segmentId);
  }

  nodesToJoin.push(endId);

  for (let i = 0; i < nodesToJoin.length - 1; i++) {
    addSegmentInternal(nodes, segments, nodesToJoin[i], nodesToJoin[i + 1]);
  }
}
