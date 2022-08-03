import { makeAutoObservable } from "mobx";
import { Position } from "../types";

interface State {
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
}

export class CursorStore {
  private _position: Position = { x: 0, y: 0 };
  altKey = false;
  ctrlKey = false;
  shiftKey = false;
  metaKey = false;

  setPostion(p: Position) {
    this._position.x = p.x;
    this._position.y = p.y;
  }

  setState(state: State) {
    this.altKey = state.altKey;
    this.ctrlKey = state.ctrlKey;
    this.shiftKey = state.shiftKey;
    this.metaKey = state.metaKey;
  }

  get position() {
    return this._position;
  }

  constructor() {
    makeAutoObservable(this);
  }
}
