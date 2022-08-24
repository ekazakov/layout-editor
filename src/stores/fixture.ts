import { makeAutoObservable, toJS } from "mobx";
import { nanoid } from "nanoid";
import { RoadNode } from "./road-node";
import { Position, FixtureDump, GateDump, Rect } from "../types";

export class Gate {
  private _connection: RoadNode | undefined = undefined;
  public readonly id: string;
  private _position: Position;

  get title() {
    return this.id.replace("fixture_gate", "g");
  }

  get position() {
    return this._position;
  }

  setPosition = (p: Position) => {
    this._position = p;
  };

  moveBy = (delta: Position, moveNodes = true) => {
    this.setPosition({
      x: this._position.x + delta.x,
      y: this._position.y + delta.y,
    });

    if (!moveNodes) {
      return;
    }
    this.connection?.moveBy(delta);
  };

  get x() {
    return this._position.x;
  }

  get y() {
    return this._position.y;
  }

  connect(node: RoadNode) {
    this._connection = node;
    node.gateId = this.id;
  }

  disconnect() {
    if (!this._connection) {
      return;
    }
    console.log("disconnect gate:", this.id, "from node:", this._connection.id);
    this._connection.gateId = undefined;
    this._connection = undefined;
  }

  get connection() {
    return this._connection;
  }

  toJSON() {
    return {
      id: this.id,
      position: {
        x: this.x,
        y: this.y,
      },
      connectionId: this._connection?.id ?? null,
    };
  }

  constructor(p: Position, id?: string) {
    this._position = p;
    this.id = id || `fixture_gate_${nanoid(7)}`;
    makeAutoObservable(this);
  }
}

export class Fixture {
  public readonly id: string;
  private _position: Position;
  public readonly size: number;

  private gates: Map<string, Gate> = new Map<string, Gate>();

  get position() {
    return this._position;
  }

  getGate(id: string) {
    return this.gates.get(id);
  }

  setPostion = (p: Position) => {
    this._position = p;
  };

  moveBy = (delta: Position, moveNodes = true) => {
    this._position = {
      x: this._position.x + delta.x,
      y: this._position.y + delta.y,
    };

    this.gates.forEach((gate) => {
      gate.moveBy(delta, moveNodes);
    });
  };

  get x() {
    return this._position.x;
  }

  get y() {
    return this._position.y;
  }

  get rect(): Rect {
    return {
      left: this.x,
      top: this.y,
      right: this.x + this.size,
      bottom: this.y + this.size,
      height: this.size,
      width: this.size,
    };
  }

  get gateList() {
    return [...this.gates.values()];
  }

  private createGates() {
    const g1 = new Gate({ x: this.x, y: this.y + this.size / 2 });
    const g2 = new Gate({ x: this.x + this.size, y: this.y + this.size / 2 });
    const g3 = new Gate({ x: this.x + this.size / 2, y: this.y });
    const g4 = new Gate({ x: this.x + this.size / 2, y: this.y + this.size });

    this.gates.set(g1.id, g1);
    this.gates.set(g2.id, g2);
    this.gates.set(g3.id, g3);
    this.gates.set(g4.id, g4);
  }

  private populateGates(gates: GateDump[], nodes: Map<string, RoadNode>) {
    gates.forEach((dump) => {
      const gate = new Gate(dump.position, dump.id);
      if (dump.connectionId) {
        const node = nodes.get(dump.connectionId);
        if (!node) {
          throw Error(`Can't find node ${dump.connectionId}`);
        }
        gate.connect(node);
      }
      this.gates.set(gate.id, gate);
    });
  }

  private constructor(p: Position, size?: number, id?: string) {
    this._position = p;
    this.id = id ?? `fixture_${nanoid(7)}`;
    this.size = size ?? 150;

    // const g1 = new Gate({ x: p.x, y: p.y + this.size / 2 });
    // const g2 = new Gate({ x: p.x + this.size, y: p.y + this.size / 2 });
    // const g3 = new Gate({ x: p.x + this.size / 2, y: p.y });
    // const g4 = new Gate({ x: p.x + this.size / 2, y: p.y + this.size });

    this.gates = new Map([
      // [g1.id, g1],
      // [g2.id, g2],
      // [g3.id, g3],
      // [g4.id, g4]
    ]);

    makeAutoObservable(this);
  }

  static createFixture(p: Position) {
    const fixture = new Fixture(p);
    fixture.createGates();
    return fixture;
  }

  static populate(dump: FixtureDump, nodes: Map<string, RoadNode>) {
    const fixture = new Fixture(dump.position, dump.size, dump.id);
    fixture.populateGates(dump.gates, nodes);
    return fixture;
  }

  toJSON() {
    return {
      id: this.id,
      position: {
        x: this.x,
        y: this.y,
      },
      size: this.size,
      gates: toJS(this.gateList.map((gate) => gate.toJSON())),
    };
  }
}
