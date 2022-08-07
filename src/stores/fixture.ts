import { makeAutoObservable, toJS } from "mobx";
import { nanoid } from "nanoid";
import { RoadNode } from "./road-node";
import { Position, RoadNodeDump } from "../types";

export class Gate {
  connection: RoadNode = undefined;
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
    this._position = {
      x: this._position.x + delta.x,
      y: this._position.y + delta.y
    };
  };

  get x() {
    return this._position.x;
  }

  get y() {
    return this._position.y;
  }

  constructor(p: Position) {
    makeAutoObservable(this);
    this._position = p;
    this.id = `fixture_gate_${nanoid(7)}`;
  }
}

export class Fixtue {
  public readonly id: string;
  private _position: Position;
  private size = 150;

  gates: Map<string, Gate> = new Map<string, Gate>();

  get position() {
    return this._position;
  }

  setPostion = (p: Position) => {
    this._position = p;
  };

  moveBy = (delta: Position) => {
    this._position = {
      x: this._position.x + delta.x,
      y: this._position.y + delta.y
    };
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
    if (!this.gates.has(gateId)) {
      console.log(`Gate ${gateId} doesn't exist for fixture ${this.id}`);
      return;
    }
    const gate = this.gates.get(gateId);
    gate.connection = node;
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
