import { makeAutoObservable } from "mobx";
import { Position } from "../types";
import { cursorStore } from "./index";
import React from "react";

interface State {
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
  buttons: number;
}

export class CursorStore {
  private _position: Position = { x: 0, y: 0 };
  private _movement: Position = { x: 0, y: 0 };
  private _snapPosition: Position | undefined = undefined;
  altKey = false;
  ctrlKey = false;
  shiftKey = false;
  metaKey = false;
  buttons = 0;

  setPosition(p: Position) {
    this._position.x = p.x;
    this._position.y = p.y;
  }

  setMovement(p: Position) {
    this._movement.x = p.x;
    this._movement.y = p.y;
  }

  setState(state: State) {
    this.altKey = state.altKey;
    this.ctrlKey = state.ctrlKey;
    this.shiftKey = state.shiftKey;
    this.metaKey = state.metaKey;
    this.buttons = state.buttons;
  }

  update(evt: MouseEvent | React.MouseEvent) {
    this.setState({
      altKey: evt.altKey,
      ctrlKey: evt.ctrlKey,
      shiftKey: evt.shiftKey,
      metaKey: evt.metaKey,
      buttons: evt.buttons,
    });

    this.setPosition({
      x: Math.round(evt.clientX),
      y: Math.round(evt.clientY),
    });

    this.setMovement({
      x: Math.round(evt.movementX),
      y: Math.round(evt.movementY),
    });
  }

  setSnapPosition(p: Position) {
    this._snapPosition = {
      x: p.x,
      y: p.y,
    };
  }

  resetSnapping() {
    this._snapPosition = undefined;
  }

  get snapPosition() {
    if (!this._snapPosition) {
      return this.position;
    }

    return {
      x: this._snapPosition.x,
      y: this._snapPosition.y,
    };
  }

  get position() {
    return {
      x: this._position.x,
      y: this._position.y,
    };
  }

  get movement() {
    return {
      x: this._movement.x,
      y: this._movement.y,
    };
  }

  get x() {
    return this._position.x;
  }

  get y() {
    return this._position.y;
  }

  get noKeys() {
    return !(this.altKey || this.ctrlKey || this.shiftKey || this.metaKey);
  }

  get isLeftButtonPressed() {
    return this.buttons === 1;
  }

  constructor() {
    makeAutoObservable(this);
  }
}
