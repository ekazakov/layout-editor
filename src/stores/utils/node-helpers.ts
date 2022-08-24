import { Position } from "../../types";
import { RoadNode } from "../road-node";
import { RoadSegment } from "../road-segment";
import { Fixture, Gate } from "../fixture";
import { SelectionStore } from "../selection";
import * as sh from "../utils/segment-helpers";
import * as fh from "../utils/fixture-helpers";

export function toggleNodeSelection(
  nodes: Map<string, RoadNode>,
  selection: SelectionStore,
  id: string
) {
  const node = nodes.get(id);
  if (!node) {
    throw new Error(`Node ${id} doesn't exist`);
  }

  const { nodeId } = selection;

  selection.reset();

  if (nodeId === id) {
    return;
  }

  selection.nodeId = id;
}

export function getNode(nodes: Map<string, RoadNode>, id: string) {
  return nodes.get(id);
}

export function deleteNode(
  nodes: Map<string, RoadNode>,
  segments: Map<string, RoadSegment>,
  fixtures: Fixture[],
  selection: SelectionStore,
  nodeId: string
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
    const gate = fh.getGate(fixtures, gateId);

    gate?.disconnect();
  }

  return true;
}

export function addNode(nodes: Map<string, RoadNode>, p: Position) {
  const node = new RoadNode(p);
  nodes.set(node.id, node);
  return node;
}

export function isConnected(
  nodes: Map<string, RoadNode>,
  segments: Map<string, RoadSegment>,
  aId: string,
  bId: string
) {
  const node = getNode(nodes, aId);
  if (node) {
    for (const segmentId of node.segmentIds) {
      const segment = sh.getSegment(segments, segmentId);
      if (segment!.start.id === bId || segment!.end.id === bId) {
        return true;
      }
    }
  }
  return false;
}
