import type { Position, LineSegment } from "../types";

// http://paulbourke.net/geometry/pointlineplane/
// http://paulbourke.net/geometry/pointlineplane/javascript.txt
export function segmentIntersection(
  segmentA: LineSegment,
  segmentB: LineSegment
): Position | undefined {
  const { start: p1, end: p2 } = segmentA;
  const { start: p3, end: p4 } = segmentB;
  // Check if none of the lines are of length 0
  if ((p1.x === p2.x && p1.y === p2.y) || (p3.x === p4.x && p3.y === p4.y)) {
    return undefined;
  }

  const denominator =
    (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);

  // Lines are parallel
  if (denominator === 0) {
    return undefined;
  }

  let ua =
    ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) /
    denominator;
  let ub =
    ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) /
    denominator;

  // is the intersection along the segments
  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
    return undefined;
  }

  // Return a object with the x and y coordinates of the intersection
  let x = p1.x + ua * (p2.x - p1.x);
  let y = p1.y + ua * (p2.y - p1.y);

  return { x, y };
}

export function magnitude(p1: Position, p2: Position) {
  return 0;
}

export function isEqualPosition(
  p1: Position,
  p2: Position
  // precision: number = Infinity
) {
  return p1.x === p2.x && p1.y === p2.y;
}

export function hasCommonPoint(line1: LineSegment, line2: LineSegment) {
  return (
    isEqualPosition(line1.start, line2.start) ||
    isEqualPosition(line1.start, line2.end) ||
    isEqualPosition(line1.end, line2.start) ||
    isEqualPosition(line1.end, line2.end)
  );
}
