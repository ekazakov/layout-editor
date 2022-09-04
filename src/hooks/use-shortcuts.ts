import useTinykeys from "use-tinykeys";
import { roadsStore, selectionManagerStore, undoManagerStore } from "../stores/index";

export function useShortcuts() {
  const undo = (evt: KeyboardEvent) => {
    evt.stopPropagation();
    evt.preventDefault();
    undoManagerStore.undo();
    // console.log("undo");
  };
  const redo = (evt: KeyboardEvent) => {
    evt.preventDefault();
    evt.stopPropagation();
    undoManagerStore.redo();
    // console.log("redo");
  };
  useTinykeys({
    Escape: () => {
      selectionManagerStore.reset();
    },
    Delete: () => {
      roadsStore.deleteSelection();
    },
    Backspace: () => {
      roadsStore.deleteSelection();
    },
    "$mod+K": () => {
      roadsStore.empty();
    },
    "$mod+KeyZ": undo,
    "$mod+KeyY": redo,
    "Shift+KeyZ": redo,
    ArrowLeft: (evt) => {
      evt.preventDefault();
      selectionManagerStore.moveBy({ x: -1, y: 0 });
    },
    ArrowRight: (evt) => {
      evt.preventDefault();
      selectionManagerStore.moveBy({ x: 1, y: 0 });
    },
    ArrowUp: (evt) => {
      evt.preventDefault();
      selectionManagerStore.moveBy({ x: 0, y: -1 });
    },
    ArrowDown: (evt) => {
      evt.preventDefault();
      selectionManagerStore.moveBy({ x: 0, y: 1 });
    },
    "Shift+ArrowLeft": (evt) => {
      evt.preventDefault();
      selectionManagerStore.moveBy({ x: -10, y: 0 });
    },
    "Shift+ArrowRight": (evt) => {
      evt.preventDefault();
      selectionManagerStore.moveBy({ x: 10, y: 0 });
    },
    "Shift+ArrowUp": (evt) => {
      evt.preventDefault();
      selectionManagerStore.moveBy({ x: 0, y: -10 });
    },
    "Shift+ArrowDown": (evt) => {
      evt.preventDefault();
      selectionManagerStore.moveBy({ x: 0, y: 10 });
    },
  });
}
