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
