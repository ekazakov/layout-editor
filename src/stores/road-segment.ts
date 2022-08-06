import { makeAutoObservable } from "mobx";
import { nanoid } from "nanoid";
import { Position, RoadSegmentDump } from "../types";
import { RoadNode } from "./road-node";

export class RoadSegment {
  public readonly id: string;

  private _p1: RoadNode;
  private _p2: RoadNode;

  get start() {
    return this._p1;
  }

  get end() {
    return this._p2;
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

    this._p1 = nodeStart;
    this._p2 = nodeEnd;
  }

  toJSON() {
    return {
      id: this.id,
      startNodeId: this._p1.id,
      endNodeId: this._p2.id
    };
  }
}
