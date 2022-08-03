import { makeAutoObservable } from "mobx";
import { nanoid } from "nanoid";
import { Position } from "../types";

export class RoadNode {
  private _position: Position = { x: 0, y: 0 };
  private _selected = false;
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

  get selected() {
    return this._selected;
  }

  toggleSelection = () => {
    this._selected = !this._selected;
  };

  set selected(selected) {
    this._selected = selected;
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
}
