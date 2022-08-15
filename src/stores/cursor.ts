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
  private _snapPosition: Position | undefined = undefined;
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

  setSnapPosition(p: Position) {
    this._snapPosition = {
      x: p.x,
      y: p.y
    };
  }

  resetSanpping() {
    this._snapPosition = undefined;
  }

  get snapPosition() {
    if (!this._snapPosition) {
      return this.position;
    }

    return {
      x: this._snapPosition.x,
      y: this._snapPosition.y
    };
  }

  get position() {
    return {
      x: this._position.x,
      y: this._position.y
    };
  }

  get x() {
    return this._position.x;
  }

  get y() {
    return this._position.y;
  }

  constructor() {
    makeAutoObservable(this);
  }
}
