import { hasCommonPoint, segmentIntersection } from "../../utils/line";
import { LineSegment, Position, Intersection } from "../../types";
import { RoadNode } from "../road-node";
import { RoadSegment } from "../road-segment";
import { Fixture } from "../fixture";
import { SelectionStore } from "../selection";
import * as nh from "./node-helpers";
import { FixturesStore, NodeStore, SegmentStore } from "../nodes";

// export function getSegment(segments: SegmentStore, id: string) {
//   return segments.get(id);
// }

export function deleteSegment(
  nodes: NodeStore,
  segments: Map<string, RoadSegment>,
  fixtures: FixturesStore,
  selection: SelectionStore,
  id: string,
) {
  if (selection.segmentId === id) {
    selection.reset();
  }
  const segment = segments.get(id);

  segments.delete(id);
  if (segment) {
    const nodeStart = nodes.get(segment.start.id);

    nodeStart?.segmentIds.delete(id);
    if (nodeStart?.segmentIds.size === 0) {
      nh.deleteNode(nodes, segments, fixtures, selection, nodeStart.id);
    }
    const nodeEnd = nodes.get(segment.end.id);
    nodeEnd?.segmentIds.delete(id);
    if (nodeEnd?.segmentIds.size === 0) {
      nh.deleteNode(nodes, segments, fixtures, selection, nodeEnd.id);
    }
  }
}

// export function toggleSegmentSelection(
//   segments: SegmentStore,
//   selection: SelectionStore,
//   id: string,
// ) {
//   const segment = segments.get(id);
//   if (!segment) {
//     throw new Error(`Segment ${id} doesn't exist`);
//   }
//
//   const { segmentId } = selection;
//   selection.reset();
//
//   if (segmentId === id) {
//     return;
//   }
//
//   selection.segmentId = id;
// }

export function addSegmentInternal(
  nodes: NodeStore,
  segments: Map<string, RoadSegment>,
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

// export function addSegmentToPosition(
//   nodes: NodeStore,
//   segments: SegmentStore,
//   startNodeId: string,
//   p: Position,
// ) {
//   const startNode = nh.getNode(nodes, startNodeId);
//   if (!startNode) {
//     throw new Error(`Node with id: ${startNodeId} doesn't exist`);
//   }
//   const endNode = nodes.add(p);
//   const segment = new RoadSegment(startNode, endNode);
//
//   endNode.segmentIds.add(segment.id);
//   startNode.segmentIds.add(segment.id);
//   segments.set(segment.id, segment);
// }

export function splitSegmentAt(
  nodes: NodeStore,
  segments: Map<string, RoadSegment>,
  fixtures: FixturesStore,
  selection: SelectionStore,
  id: string,
  p: Position,
) {
  const segment = segments.get(id);

  if (!segment) {
    throw new Error(`Segment ${id} doesn't exist`);
  }

  const newNode = nodes.add(p);
  addSegmentInternal(nodes, segments, segment.start.id, newNode.id);
  addSegmentInternal(nodes, segments, newNode.id, segment.end.id);
  deleteSegment(nodes, segments, fixtures, selection, id);
  return newNode;
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

  return intersections;
}

export function addSegment(
  nodes: NodeStore,
  segments: Map<string, RoadSegment>,
  fixtures: FixturesStore,
  selection: SelectionStore,
  intersections: Intersection[],
  startId: string,
  endId: string,
) {
  if (startId === endId) {
    console.log(`Tring to connect node ${startId} to itself`);
    return;
  }
  const nodesToJoin = [endId];

  for (const int of intersections) {
    const segment = segments.get(int.segmentId);
    if (!segment) {
      throw new Error(`Segment ${int.segmentId} doesn't exist`);
    }

    const newNode = nodes.add(int.point);
    nodesToJoin.push(newNode.id);
    addSegmentInternal(nodes, segments, segment.start.id, newNode.id);
    addSegmentInternal(nodes, segments, newNode.id, segment.end.id);

    deleteSegment(nodes, segments, fixtures, selection, int.segmentId);
  }

  nodesToJoin.push(startId);

  for (let i = 0; i < nodesToJoin.length - 1; i++) {
    addSegmentInternal(nodes, segments, nodesToJoin[i], nodesToJoin[i + 1]);
  }
}
