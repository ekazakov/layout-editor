import { action, makeAutoObservable } from "mobx";
import { Position } from "../types";
import { SelectionManagerStore } from "./selection/selection-manager";
import { CursorStore } from "./cursor";
import { NodeStore } from "./nodes";
import { SegmentStore } from "./segments";
import { FixturesStore } from "./fixtures";

const fn = action(() => true);

type ActionFn = (...args: unknown[]) => boolean;

export class RoadBuilder {
  addSegment(startId: string, endId: string) {}

  addItemToSelection(id: string) {}

  selectSingleItem(id: string) {}

  splitSegment(id: string) {}

  connectSegmentToFixture(nodeId: string, fixtureId: string) {}

  connectFixtureToFixture(startId: string, endId: string) {}

  toggleItemInSelection(id: string) {}

  startMultiSelection() {}

  match(...actions: ActionFn[]) {
    for (let i = 0; i < actions.length; i++) {
      const result = actions[i]();
      if (result) {
        return;
      }
    }
  }

  constructor(
    private readonly selection: SelectionManagerStore,
    private readonly cursor: CursorStore,
    private readonly nodes: NodeStore,
    private readonly segments: SegmentStore,
    private readonly fixtures: FixturesStore,
  ) {
    makeAutoObservable(this);
  }
}
