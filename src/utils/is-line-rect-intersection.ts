import { LineSegment, Rect } from "../types";
import { segmentIntersection } from "./line";
import { isInsideRect } from "./is-inside-rect";

export function isLineRectIntersection(line: LineSegment, rect: Rect) {
  const top = {
    start: { x: rect.left, y: rect.top },
    end: { x: rect.right, y: rect.top },
  };
  const right = {
    start: { x: rect.right, y: rect.top },
    end: { x: rect.right, y: rect.bottom },
  };
  const bottom = {
    start: { x: rect.left, y: rect.bottom },
    end: { x: rect.right, y: rect.bottom },
  };
  const left = {
    start: { x: rect.left, y: rect.top },
    end: { x: rect.right, y: rect.bottom },
  };

  return Boolean(
    segmentIntersection(line, top) ||
      segmentIntersection(line, right) ||
      segmentIntersection(line, bottom) ||
      segmentIntersection(line, left) ||
      isInsideRect(line.start, rect) ||
      isInsideRect(line.end, rect),
  );
}
