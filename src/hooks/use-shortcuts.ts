import useTinykeys from "use-tinykeys";
import { roadBuilder, selectionStore, undoManagerStore } from "../stores";

export function useShortcuts() {
  const undo = (evt: KeyboardEvent) => {
    evt.stopPropagation();
    evt.preventDefault();
    undoManagerStore.undo();
  };
  const redo = (evt: KeyboardEvent) => {
    evt.preventDefault();
    evt.stopPropagation();
    undoManagerStore.redo();
  };
  useTinykeys({
    Escape: () => {
      selectionStore.reset();
    },
    Delete: () => {
      roadBuilder.deleteSelection();
    },
    Backspace: () => {
      roadBuilder.deleteSelection();
    },
    "$mod+K": () => {
      roadBuilder.empty();
    },
    "$mod+KeyZ": undo,
    "$mod+KeyY": redo,
    "Shift+KeyZ": redo,
    ArrowLeft: (evt) => {
      evt.preventDefault();
      selectionStore.moveBy({ x: -1, y: 0 });
    },
    ArrowRight: (evt) => {
      evt.preventDefault();
      selectionStore.moveBy({ x: 1, y: 0 });
    },
    ArrowUp: (evt) => {
      evt.preventDefault();
      selectionStore.moveBy({ x: 0, y: -1 });
    },
    ArrowDown: (evt) => {
      evt.preventDefault();
      selectionStore.moveBy({ x: 0, y: 1 });
    },
    "Shift+ArrowLeft": (evt) => {
      evt.preventDefault();
      selectionStore.moveBy({ x: -10, y: 0 });
    },
    "Shift+ArrowRight": (evt) => {
      evt.preventDefault();
      selectionStore.moveBy({ x: 10, y: 0 });
    },
    "Shift+ArrowUp": (evt) => {
      evt.preventDefault();
      selectionStore.moveBy({ x: 0, y: -10 });
    },
    "Shift+ArrowDown": (evt) => {
      evt.preventDefault();
      selectionStore.moveBy({ x: 0, y: 10 });
    },
  });
}
