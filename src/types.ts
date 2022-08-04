export interface Position {
  x: number;
  y: number;
}

export interface LineSegment {
  _p1: Position;
  _p2: Position;
}

export interface Intersection {
  segmentId: string;
  point: Position;
}
