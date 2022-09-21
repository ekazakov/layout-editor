import { RoadNode } from "../road-node";
import * as sh from "../utils/segment-helpers";
import { NodeStore } from "../nodes";
import { SegmentStore } from "../segments";
import { FixturesStore } from "../fixtures";

export function getNode(nodes: NodeStore, id: string) {
  return nodes.getNode(id);
}

export function deleteNode(
  nodes: NodeStore,
  segments: SegmentStore,
  fixtures: FixturesStore,
  nodeId: string,
) {
  const node = nodes.getNode(nodeId);
  if (!node) {
    return false;
  }

  nodes._delete(nodeId);
  const { gateId, segmentIds } = node;

  for (const segmentId of segmentIds) {
    sh.deleteSegment(nodes, segments, fixtures, segmentId);
  }


  if (gateId) {
    const gate = fixtures.getGate(gateId);

    gate?.disconnect();
  }

  return true;
}

export function isConnected(
  nodes: Map<string, RoadNode>,
  segments: SegmentStore,
  aId: string,
  bId: string,
) {
  const node = nodes.get(aId);
  if (node) {
    for (const segmentId of node.segmentIds) {
      const segment = segments.getSegment(segmentId);
      if (segment!.start.id === bId || segment!.end.id === bId) {
        return true;
      }
    }
  }
  return false;
}
