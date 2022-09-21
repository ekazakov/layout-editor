import { IReactionDisposer, makeAutoObservable, reaction, toJS } from "mobx";
import { nanoid } from "nanoid";
import { RoadNode } from "./road-node";
import { Position, FixtureDump, GateDump, Rect } from "../types";
import { NodeStore } from "./nodes";
import { getDistance } from "../utils/get-distance";
import { cursorStore } from "./index";

export class Gate {
  private _connection: RoadNode | undefined = undefined;
  public readonly id: string;
  public readonly fixtureId: string;
  private _position: Position;
  private disposeReaction: IReactionDisposer | undefined;

  get title() {
    return this.id.replace("fixture_gate", "g");
  }

  get position() {
    return this._position;
  }

  setPosition = (p: Position) => {
    this._position = p;
  };

  moveBy = (delta: Position) => {
    this.setPosition({
      x: this._position.x + delta.x,
      y: this._position.y + delta.y,
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
    node.gateId = this.id;
    node.fixtureId = this.fixtureId;

    node.setPosition(this._position);

    // TODO: support multiply connected nodes
    this.disposeReaction = reaction(
      () => this._connection?.position,
      (p) => {
        if (p && getDistance(this._position, p) > 30) {
          this.disconnect();
        }
      },
    );
  }

  disconnect() {
    this.disposeReaction?.();
    if (!this._connection) {
      return;
    }
    console.log("disconnect gate:", this.id, "from node:", this._connection.id);
    this._connection.gateId = undefined;
    this._connection.fixtureId = undefined;
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

  constructor(p: Position, fixtureId: string, id?: string) {
    this._position = p;
    this.fixtureId = fixtureId;
    this.id = id || `fixture_gate#${nanoid(7)}`;
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

  moveBy = (delta: Position) => {
    this._position = {
      x: this._position.x + delta.x,
      y: this._position.y + delta.y,
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
    const g1 = new Gate({ x: this.x, y: this.y + this.size / 2 }, this.id);
    const g2 = new Gate({ x: this.x + this.size, y: this.y + this.size / 2 }, this.id);
    const g3 = new Gate({ x: this.x + this.size / 2, y: this.y }, this.id);
    const g4 = new Gate({ x: this.x + this.size / 2, y: this.y + this.size }, this.id);

    this.gates.set(g1.id, g1);
    this.gates.set(g2.id, g2);
    this.gates.set(g3.id, g3);
    this.gates.set(g4.id, g4);
  }

  private populateGates(gates: GateDump[], nodes: NodeStore) {
    gates.forEach((dump) => {
      const gate = new Gate(dump.position, this.id, dump.id);
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
    this.id = id ?? `fixture#${nanoid(7)}`;
    this.size = size ?? 150;

    this.gates = new Map();

    makeAutoObservable(this);
  }

  static createFixture(p: Position) {
    const fixture = new Fixture(p);
    fixture.createGates();
    return fixture;
  }

  static populate(dump: FixtureDump, nodes: NodeStore) {
    const fixture = new Fixture(dump.position, dump.size, dump.id);
    fixture.populateGates(dump.gates, nodes);
    return fixture;
  }

  get toJSON() {
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
