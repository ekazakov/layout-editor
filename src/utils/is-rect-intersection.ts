import { Position, Rect } from "../types";
import { isInsideRect } from "./is-inside-rect";

export function isRectIntersection(rect1: Rect, rect2: Rect): boolean {
  const tl: Position = {
    x: rect1.left,
    y: rect1.top,
  };
  const tr: Position = {
    x: rect1.right,
    y: rect1.top,
  };
  const bl: Position = {
    x: rect1.left,
    y: rect1.bottom,
  };
  const br: Position = {
    x: rect1.right,
    y: rect1.bottom,
  };

  return (
    isInsideRect(tl, rect2) ||
    isInsideRect(tr, rect2) ||
    isInsideRect(bl, rect2) ||
    isInsideRect(br, rect2)
  );
}
