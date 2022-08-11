import { Position, ElementType } from "../types";

export function findHoveredElements(p: Position) {
  const elements = document.elementsFromPoint(p.x, p.y);

  return elements.filter(
    (elem) =>
      (elem instanceof HTMLElement || elem instanceof SVGElement) &&
      elem.dataset?.type
  ) as (HTMLElement | SVGElement)[];
}

export function matchElementTypeAtPosition(p: Position, type: ElementType) {
  console.log(findHoveredElements(p));
  return findHoveredElements(p).find((elem) => elem.dataset.type === type);
}
