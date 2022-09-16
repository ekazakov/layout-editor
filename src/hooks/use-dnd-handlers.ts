import React from "react";
import { dndStore } from "../stores";

const onPointerDown = (evt: React.PointerEvent) => {
  const element = evt.target as HTMLElement;
  element.setPointerCapture(evt.pointerId);
  dndStore.startDrag();
};

const onPointerUp = (evt: React.PointerEvent) => {
  dndStore.endDrag();
  const element = evt.target as HTMLElement;
  element.releasePointerCapture(evt.pointerId);
};
const onPointerMove = () => {
  dndStore.onDrag();
};

const dndProps = { onPointerDown, onPointerMove, onPointerUp };

export function useDndHandlers() {
  return dndProps;
}
