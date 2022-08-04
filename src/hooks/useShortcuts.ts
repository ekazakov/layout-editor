import useTinykeys from "use-tinykeys";
import { roadsStore } from "../stores/index";

export function useShortcuts() {
  useTinykeys({
    Escape: () => {
      roadsStore.resetSelectedNode();
    },
    Delete: () => {
      // console.log("Delete");
      roadsStore.deleteSelectedNode();
    },
    Backspace: () => {
      // console.log("Backspace");
      roadsStore.deleteSelectedNode();
      roadsStore.deleteSelectedSegment();
    }
  });
}
