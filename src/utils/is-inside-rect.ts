import { Position, Rect } from "../types";

export function isInsideRect(p: Position, rect: Rect) {
  return (
    rect.left < p.x && p.x < rect.right && rect.top < p.y && p.y < rect.bottom
  );
}
