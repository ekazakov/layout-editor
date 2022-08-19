import { makeAutoObservable, toJS } from "mobx";
import { nanoid } from "nanoid";
import { Position, RoadNodeDump } from "../types";
import { undoManagerStore } from "./index";

export class RoadNode {
  private _position: Position = { x: 0, y: 0 };
  public readonly id: string;

  gateId: string | undefined = undefined;

  private tracker = undoManagerStore.createTrackWithDebounce();

  segmentIds: Set<string> = new Set<string>();

  setPostion = (p: Position) => {
    this.tracker(() => {
      // console.log("setPosition", p);
      this._position = {
        x: p.x,
        y: p.y
      };
    });
  };

  moveBy = (delta: Position) => {
    this.setPostion({
      x: this._position.x + delta.x,
      y: this._position.y + delta.y
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

  get track() {
    return {
      id: this.id,
      position: {
        x: this.x,
        y: this.y
      },
      segmentIds: [...this.segmentIds.values()],
      gateId: this.gateId
    };
  }

  constructor(p: Position, id?: string) {
    this._position = { x: p.x, y: p.y };
    this.id = id ?? `node_${nanoid(7)}`;
    makeAutoObservable(this);
  }

  static populate(dump: RoadNodeDump) {
    const node = new RoadNode(dump.position, dump.id);
    node.segmentIds = new Set(dump.segmentIds);
    return node;
  }

  toJSON() {
    return this.track;
  }
}
