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
  });
}
