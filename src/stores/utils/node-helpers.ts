import { Position } from "../../types";
import { RoadNode } from "../road-node";
import { RoadSegment } from "../road-segment";
import { Fixture, Gate } from "../fixture";
import { SelectionStore } from "../selection";
import * as sh from "../utils/segment-helpers";
import * as fh from "../utils/fixture-helpers";
import { FixturesStore, NodeStore, SegmentStore } from "../nodes";

export function getNode(nodes: NodeStore, id: string) {
  return nodes.get(id);
}

export function deleteNode(
  nodes: NodeStore,
  segments: Map<string, RoadSegment>,
  fixtures: FixturesStore,
  selection: SelectionStore,
  nodeId: string,
) {
  const node = getNode(nodes, nodeId);
  if (!node) {
    return false;
  }

  nodes.delete(nodeId);
  const { gateId, segmentIds } = node;

  for (const segmentId of segmentIds) {
    sh.deleteSegment(nodes, segments, fixtures, selection, segmentId);
  }

  if (selection.nodeId === nodeId) {
    selection.reset();
  }

  if (gateId) {
    const gate = fixtures.getGate(gateId);

    gate?.disconnect();
  }

  return true;
}

// export function addNode(nodes: NodeStore, p: Position) {
//   const node = new RoadNode(p);
//   nodes.set(node.id, node);
//   return node;
// }

export function isConnected(
  nodes: Map<string, RoadNode>,
  segments: SegmentStore,
  aId: string,
  bId: string,
) {
  const node = nodes.get(aId);
  if (node) {
    for (const segmentId of node.segmentIds) {
      const segment = segments.get(segmentId);
      if (segment!.start.id === bId || segment!.end.id === bId) {
        return true;
      }
    }
  }
  return false;
}
