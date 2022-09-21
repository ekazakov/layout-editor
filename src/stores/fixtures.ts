import { Fixture } from "./fixture";
import { CursorStore } from "./cursor";
import * as fh from "./utils/fixture-helpers";
import { RoadNode } from "./road-node";
import { magnitude } from "../utils/line";
import { NodeStore } from "./nodes";
import { Position } from "../types";
import { makeAutoObservable } from "mobx";

function getMinIndex(arr: any[]) {
  let minIndex = 0;

  for (let i = 1; i < arr.length; i++) {
    if (arr[minIndex] > arr[i]) {
      minIndex = i;
    }
  }

  return minIndex;
}

export class FixturesStore {
  private fixtures: Map<string, Fixture> = new Map<string, Fixture>();
  private nodes: NodeStore = null!;
  private cursor: CursorStore = null!;

  addFixture = (p: Position) => {
    const fixture = Fixture.createFixture(p);
    this.fixtures.set(fixture.id, fixture);
    return fixture;
  };

  set = (id: string, fixture: Fixture) => this.fixtures.set(id, fixture);

  getFixture = (id: string) => this.fixtures.get(id);

  has = (id: string) => this.fixtures.has(id);

  deleteFixture = (fixtureId: string) => fh.deleteFixture(this.fixtures, fixtureId);

  getGate(id: string) {
    return this.list.find((fixture) => fixture.getGate(id))?.getGate(id);
  }

  connectToGate = (gateId: string, node: RoadNode) => fh.connectToGate(this.list, gateId, node);

  updateSnapGates(nodeId: string) {
    if (!nodeId) {
      throw new Error();
    }
    const node = this.nodes.get(nodeId);
    if (!node) {
      return;
    }

    if (node.gateId) {
      const gate = this.getGate(node.gateId);
      if (gate && magnitude(gate, this.cursor.position) >= 30) {
        this.cursor.resetSnapping();
      }
      return;
    }

    const distances = this.gates.map((gate) => {
      return magnitude(gate, node);
    });

    const minIndex = getMinIndex(distances);

    if (distances.length === 0 || distances[minIndex] >= 30) {
      this.cursor.resetSnapping();
      return;
    }

    const gate = this.gates[minIndex];
    this.cursor.setSnapPosition(gate);
    this.connectToGate(gate.id, node);
  }

  get list() {
    return [...this.fixtures.values()];
  }

  get count() {
    return this.fixtures.size;
  }

  get gates() {
    return this.list.flatMap((fixture) => fixture.gateList);
  }

  clear() {
    this.fixtures.clear();
  }


  setCursor(cursor: CursorStore) {
    this.cursor = cursor;
  }

  setNodes(nodes: NodeStore) {
    this.nodes = nodes;
  }

  constructor() {
    makeAutoObservable(this);
  }
}
