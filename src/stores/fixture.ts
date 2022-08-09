import { makeAutoObservable, toJS } from "mobx";
import { nanoid } from "nanoid";
import { RoadNode } from "./road-node";
import { Position } from "../types";

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

  setPostion = (p: Position) => {
    this._position = p;
  };

  moveBy = (delta: Position) => {
    this.setPostion({
      x: this._position.x + delta.x,
      y: this._position.y + delta.y
    });

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
  }

  get connection() {
    return this._connection;
  }

  constructor(p: Position) {
    this._position = p;
    this.id = `fixture_gate_${nanoid(7)}`;
    makeAutoObservable(this);
  }
}

export class Fixture {
  public readonly id: string;
  private _position: Position;
  public readonly size = 150;

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

  moveBy = (delta: Position) => {
    this._position = {
      x: this._position.x + delta.x,
      y: this._position.y + delta.y
    };
    this.gates.forEach((gate) => {
      gate.moveBy(delta);
    });
  };

  get x() {
    return this._position.x;
  }

  get y() {
    return this._position.y;
  }

  get gateList() {
    return [...this.gates.values()];
  }

  connect(gateId: string, node: RoadNode) {
    const gate = this.gates.get(gateId);
    if (!gate) {
      console.error(`Gate ${gateId} doesn't exist for fixture ${this.id}`);
      return;
    }

    gate.connect(node);
  }

  constructor(p: Position) {
    this._position = p;
    this.id = `fixture_${nanoid(7)}`;

    const g1 = new Gate({ x: p.x, y: p.y + this.size / 2 });
    const g2 = new Gate({ x: p.x + this.size, y: p.y + this.size / 2 });
    const g3 = new Gate({ x: p.x + this.size / 2, y: p.y });
    const g4 = new Gate({ x: p.x + this.size / 2, y: p.y + this.size });

    this.gates = new Map([
      [g1.id, g1],
      [g2.id, g2],
      [g3.id, g3],
      [g4.id, g4]
    ]);

    makeAutoObservable(this);
  }
}
