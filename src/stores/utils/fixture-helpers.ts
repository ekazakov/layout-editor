import { RoadNode } from "../road-node";
import { RoadSegment } from "../road-segment";
import { Fixture, Gate } from "../fixture";
import { SelectionStore } from "../selection";

export function getGate(fixtureList: Fixture[], id: string) {
  return fixtureList.find((fixtue) => fixtue.getGate(id))?.getGate(id);
}

export function toggleGateSelection(fixtureList: Fixture[], selection: SelectionStore, id: string) {
  const gate = getGate(fixtureList, id);
  if (!gate) {
    throw new Error(`Gate ${id} doesn't exist`);
  }

  const { gateId } = selection;
  selection.reset();

  if (gateId === id) {
    return;
  }

  selection.gateId = id;
}

export function connectToGate(fixtureList: Fixture[], gateId: string, node: RoadNode) {
  const gate = getGate(fixtureList, gateId);
  if (!gate) {
    console.error(`Gate ${gateId} doesn't exist`);
    return;
  }
  console.log("connect gate:", gateId, "with node:", node.id);
  gate.connect(node);
}

export function deleteFixture(
  fixtures: Map<string, Fixture>,
  selection: SelectionStore,
  fixtureId: string,
) {
  if (selection.fixtureId === fixtureId) {
    selection.reset();
  }

  const fixtue = fixtures.get(fixtureId);
  if (fixtue) {
    fixtue.gateList.forEach((gate) => gate.disconnect());
  }
  return fixtures.delete(fixtureId);
}
