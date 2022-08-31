import { makeAutoObservable } from "mobx";
import { Position, Rect } from "../../types";

export class SelectionRect {
  private selectionStart: Position | undefined = undefined;
  private selectionEnd: Position | undefined = undefined;

  reset() {
    this.selectionStart = undefined;
    this.selectionEnd = undefined;
  }

  moveBy(delta: Position) {
    if (this.selectionStart && this.selectionEnd) {
      this.selectionStart = {
        x: this.selectionStart.x + delta.x,
        y: this.selectionStart.y + delta.y,
      };
      this.selectionEnd = {
        x: this.selectionEnd.x + delta.x,
        y: this.selectionEnd.y + delta.y,
      };
    }
  }

  get rect(): Readonly<Rect> | undefined {
    if (!this.start || !this.end) {
      return;
    }

    let top, left, right, bottom;
    if (this.start.x <= this.end.x) {
      left = this.start.x;
      right = this.end.x;
    } else {
      left = this.end.x;
      right = this.start.x;
    }

    if (this.start.y <= this.end.y) {
      top = this.start.y;
      bottom = this.end.y;
    } else {
      top = this.end.y;
      bottom = this.start.y;
    }

    return {
      top,
      left,
      right,
      bottom,
      width: Math.abs(left - right),
      height: Math.abs(top - bottom),
    };
  }

  get start() {
    return this.selectionStart;
  }

  get end() {
    return this.selectionEnd;
  }

  setStart(p: Position) {
    this.reset();
    this.selectionStart = { x: p.x, y: p.y };
    this.selectionEnd = undefined;
  }

  setEnd(p: Position) {
    this.selectionEnd = { x: p.x, y: p.y };
  }

  get inProgress() {
    return this.start && !this.end;
  }
  constructor() {
    makeAutoObservable(this);
  }
}
