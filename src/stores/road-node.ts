import { makeAutoObservable } from "mobx";
import { nanoid } from "nanoid";
import { Position, RoadNodeDump } from "../types";

export class RoadNode {
  private _position: Position = { x: 0, y: 0 };
  public readonly id: string;

  // TODO: make private
  gateId: string | undefined = undefined;

  fixtureId: string | undefined = undefined;

  segmentIds: Set<string> = new Set<string>();

  setPosition = (p: Position) => {
    this._position = {
      x: p.x,
      y: p.y,
    };
  };

  moveBy = (delta: Position) => {
    this.setPosition({
      x: this._position.x + delta.x,
      y: this._position.y + delta.y,
    });
  };

  get position() {
    return this._position;
  }

  get x() {
    return this._position.x;
  }

  get y() {
    return this._position.y;
  }

  get toJSON() {
    return {
      id: this.id,
      position: {
        x: this.x,
        y: this.y,
      },
      segmentIds: [...this.segmentIds.values()],
      gateId: this.gateId,
    };
  }

  constructor(p: Position, id?: string) {
    this._position = { x: p.x, y: p.y };
    this.id = id ?? `node#${nanoid(7)}`;
    makeAutoObservable(this);
  }

  static populate(dump: RoadNodeDump) {
    const node = new RoadNode(dump.position, dump.id);
    node.segmentIds = new Set(dump.segmentIds);
    return node;
  }

}
