import { makeAutoObservable } from "mobx";
import { Position } from "../types";

export class CursorStore {
  private _position: Position = { x: 0, y: 0 };

  setPostion(p: Position) {
    this._position.x = p.x;
    this._position.y = p.y;
  }

  get position() {
    return this._position;
  }

  constructor() {
    makeAutoObservable(this);
  }
}
