import { makeAutoObservable } from "mobx";
import { Position, Rect } from "../types";
import { NodeStore } from "./nodes";
import {SegmentStore} from "./segments";
import {FixturesStore} from "./fixtures";

type ElementType = "segment" | "node" | "fixture" | "gate";

export type SelectionItem = { type: ElementType; id: string };
export type NoneSelectionItem = Readonly<{ type: "none"; id: "" }>;

export const NoneSelection: NoneSelectionItem = {
  type: "none",
  id: "",
};

type Selected = SelectionItem | SelectionItem[] | NoneSelectionItem;

export class SelectionStore {
  selected: Selected = NoneSelection;
  isMultiSelection: boolean = false;

  private nodes: NodeStore = null!;
  private fixtures: FixturesStore = null!;
  private segments: SegmentStore = null!;

  private selectionStart: Position | undefined = undefined;
  private selectionEnd: Position | undefined = undefined;

  updateSelection(newSelection: NoneSelectionItem): void;
  updateSelection(newSelection: SelectionItem): void;
  updateSelection(newSelection: SelectionItem[]): void;
  updateSelection(newSelection: SelectionItem | SelectionItem[] | NoneSelectionItem): void {
    this.selected = newSelection;
    if (Array.isArray(newSelection)) {
      if (newSelection.length === 0) {
        throw new Error(`Multi selection can't be empty array`);
      }
      this.isMultiSelection = true;
    }
  }

  reset() {
    this.selectionStart = undefined;
    this.selectionEnd = undefined;
    this.updateSelection(NoneSelection);
  }

  get hasSelection() {
    if (Array.isArray(this.selected)) {
      return true;
    }

    return this.selected.type !== "none";
  }

  get segmentId() {
    if (Array.isArray(this.selected) || this.selected.type !== "segment") {
      return "";
    }
    return this.selected.id;
  }

  set segmentId(id: string) {
    if (!id) {
      throw Error(`Segment id can't be empty`);
    }

    if (!id.startsWith("segment")) {
      throw new Error(`Tring assign to segment selection wrong id ${id}`);
    }

    this.updateSelection({ type: "segment", id });
  }

  get nodeId() {
    if (Array.isArray(this.selected) || this.selected.type !== "node") {
      return "";
    }
    return this.selected.id;
  }

  set nodeId(id: string) {
    if (!id) {
      throw Error(`Node id can't be empty`);
    }

    if (!id.startsWith("node")) {
      throw new Error(`Tring assign to node selection wrong id ${id}`);
    }
    this.updateSelection({ type: "node", id });
  }

  get fixtureId() {
    if (Array.isArray(this.selected) || this.selected.type !== "fixture") {
      return "";
    }
    return this.selected.id;
  }

  set fixtureId(id: string) {
    if (!id) {
      throw Error(`Fixture id can't be empty`);
    }

    if (!id.startsWith("fixture")) {
      throw new Error(`Tring assign to fixture selection wrong id ${id}`);
    }
    this.updateSelection({ type: "fixture", id });
  }

  get gateId() {
    if (Array.isArray(this.selected) || this.selected.type !== "gate") {
      return "";
    }
    return this.selected.id;
  }

  set gateId(id: string) {
    if (!id) {
      throw Error(`Fixture id can't be empty`);
    }

    if (!id.startsWith("fixture_gate")) {
      throw new Error(`Tring assign to gate selection wrong id ${id}`);
    }

    this.updateSelection({ type: "gate", id });
  }

  setStart(p: Position) {
    this.reset();
    this.selectionStart = { x: p.x, y: p.y };
    this.selectionEnd = undefined;
  }

  setEnd(p: Position) {
    this.selectionEnd = { x: p.x, y: p.y };
  }

  get isEmpty() {
    return !Array.isArray(this.selected) && this.selected.type === "none";
  }

  get multiSelectInProgress() {
    return this.start && !this.end;
  }

  get selectionRect(): Readonly<Rect> | undefined {
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

  moveSelectionBy(delta: Position) {
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

  constructor() {
    makeAutoObservable(this);
  }

  setNodes(nodes: NodeStore) {
    this.nodes = nodes;
  }

  setFixtures(fixtures: FixturesStore) {
    this.fixtures = fixtures;
  }

  setSegments(segments: SegmentStore) {
    this.segments = segments;
  }
}
