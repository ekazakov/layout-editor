import { Fixture, Gate, RoadNode, RoadSegment } from "./stores";
import { SingleItem } from "./stores/selection/single-item";
import { MultiItems } from "./stores/selection/multi-items";
import { NoneSelectionItem } from "./stores/selection/selection-manager";

export interface Position {
  x: number;
  y: number;
}

export interface LineSegment {
  start: Position;
  end: Position;
}

export interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface Intersection {
  segmentId: string;
  point: Position;
}

export interface RoadNodeDump {
  id: string;
  position: {
    x: number;
    y: number;
  };
  segmentIds: string[];
}

export interface RoadSegmentDump {
  id: string;
  startNodeId: string;
  endNodeId: string;
}

export interface GateDump {
  id: string;
  position: {
    x: number;
    y: number;
  };
  connectionId: string | null;
}

export interface FixtureDump {
  id: string;
  position: {
    x: number;
    y: number;
  };
  size: number;
  gates: GateDump[];
}

export interface RoadsDump {
  nodes: RoadNodeDump[];
  segments: RoadSegmentDump[];
  fixtures: FixtureDump[];
}

export type ElementType =
  | "canvas"
  | "road-node"
  | "road-segment"
  | "fixture"
  | "fixture_gate"
  | "none";

export type ItemType = "segment" | "node" | "fixture" | "fixture_gate";

export type Item = RoadSegment | RoadNode | Fixture | Gate;

export type Selection =
  | { type: "single"; value: SingleItem }
  | { type: "multi"; value: MultiItems }
  | NoneSelectionItem;
