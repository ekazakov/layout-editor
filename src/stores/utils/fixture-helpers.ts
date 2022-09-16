import { RoadNode } from "../road-node";
import { Fixture } from "../fixture";
import { SelectionManagerStore } from "../selection/selection-manager";

export function getGate(fixtureList: Fixture[], id: string) {
  return fixtureList.find((fixtue) => fixtue.getGate(id))?.getGate(id);
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
  selection: SelectionManagerStore,
  fixtureId: string,
) {
  if (selection.isSingle && selection.isSelected(fixtureId)) {
    selection.reset();
  }

  const fixture = fixtures.get(fixtureId);
  if (fixture) {
    fixture.gateList.forEach((gate) => gate.disconnect());
  }
  return fixtures.delete(fixtureId);
}
