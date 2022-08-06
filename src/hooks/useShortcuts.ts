import useTinykeys from "use-tinykeys";
import { roadsStore, selectionStore, undoManagerStore } from "../stores/index";

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
      selectionStore.reset();
    },
    Delete: () => {
      // console.log("Delete");
      roadsStore.deleteSelectedNode();
      roadsStore.deleteSelectedSegment();
    },
    Backspace: () => {
      // console.log("Backspace");
      roadsStore.deleteSelectedNode();
      roadsStore.deleteSelectedSegment();
    },
    "$mod+K": () => {
      roadsStore.empty();
    },
    "$mod+KeyZ": undo,
    "$mod+KeyY": redo,
    "Shift+KeyZ": redo
  });
}
