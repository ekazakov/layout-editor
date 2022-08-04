import { makeAutoObservable, toJS } from "mobx";
import { nanoid } from "nanoid";
import { Position } from "../types";

export class RoadNode {
  private _position: Position = { x: 0, y: 0 };
  public readonly id: string;

  segmentIds: Set<string> = new Set<string>();

  setPostion = (p: Position) => {
    this._position = p;
  };

  moveBy = (delta: Position) => {
    this._position = {
      x: this._position.x + delta.x,
      y: this._position.y + delta.y
    };
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

  constructor(p: Position, id?: string) {
    makeAutoObservable(this);
    this._position = p;
    this.id = id ?? `node_${nanoid(7)}`;
  }

  toJSON() {
    return {
      id: this.id,
      position: toJS(this._position),
      segmentIds: [...this.segmentIds.values()]
    };
  }
}
