export interface Position {
  x: number;
  y: number;
}

export interface LineSegment {
  start: Position;
  end: Position;
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
  | "fixture-gate"
  | "none";
