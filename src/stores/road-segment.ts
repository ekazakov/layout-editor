import { makeAutoObservable } from "mobx";
import { nanoid } from "nanoid";
import { Position } from "../types";
import { RoadNode } from "./road-node";

export class RoadSegment {
  public readonly id: string;
  private _selected = false;
  _p1: RoadNode;
  _p2: RoadNode;

  nodeStartId: string = "";
  nodeEndId: string = "";

  set selected(selected: boolean) {
    this._selected = selected;
  }

  get selected() {
    return this._selected;
  }

  get start() {
    return this._p1.position;
  }

  get end() {
    return this._p2.position;
  }

  get middle() {
    return {
      x: (this._p1.x + this._p2.x) / 2,
      y: (this._p1.y + this._p2.y) / 2
    };
  }

  moveBy = (delta: Position) => {
    this._p1.moveBy(delta);
    this._p2.moveBy(delta);
  };

  constructor(nodeStart: RoadNode, nodeEnd: RoadNode, id?: string) {
    makeAutoObservable(this);
    this.id = id ?? `segment_${nanoid(7)}`;
    this.nodeStartId = nodeStart.id;
    this.nodeEndId = nodeEnd.id;
    this._p1 = nodeStart;
    this._p2 = nodeEnd;
  }
}
