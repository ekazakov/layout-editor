import { RoadNode } from "../road-node";
import * as sh from "../utils/segment-helpers";
import { NodeStore } from "../nodes";
import { SegmentStore } from "../segments";
import { FixturesStore } from "../fixtures";
import { SelectionManagerStore } from "../selection/selection-manager";

export function getNode(nodes: NodeStore, id: string) {
  return nodes.get(id);
}

export function deleteNode(
  nodes: NodeStore,
  segments: SegmentStore,
  fixtures: FixturesStore,
  selection: SelectionManagerStore,
  nodeId: string,
) {
  const node = nodes.get(nodeId);
  if (!node) {
    return false;
  }

  nodes._delete(nodeId);
  const { gateId, segmentIds } = node;

  for (const segmentId of segmentIds) {
    sh.deleteSegment(nodes, segments, fixtures, selection, segmentId);
  }

  const { selected } = selection;
  if (selected.type === "single" && selected.value.id === nodeId) {
    selection.reset();
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
      const segment = segments.get(segmentId);
      if (segment!.start.id === bId || segment!.end.id === bId) {
        return true;
      }
    }
  }
  return false;
}
