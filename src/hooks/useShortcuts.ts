import useTinykeys from "use-tinykeys";
import { nodesStore } from "../stores/index";

export function useShortcuts() {
  useTinykeys({
    Escape: () => {
      nodesStore.resetSelectedNode();
    },
    Delete: () => {
      // console.log("Delete");
      nodesStore.deleteSelectedNode();
    },
    Backspace: () => {
      // console.log("Backspace");
      nodesStore.deleteSelectedNode();
      nodesStore.deleteSelectedSegment();
    }
  });
}
