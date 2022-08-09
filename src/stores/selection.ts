import { makeAutoObservable, reaction, toJS } from "mobx";
import { LineSegment, Position } from "../types";
import { RoadNode } from "./road-node";
import { RoadSegment } from "./road-segment";

type ElementType = "segment" | "node" | "fixture";

type SelectionItem = { type: ElementType; id: string };
export type NoneSelectionItem = Readonly<{ type: "none"; id: "" }>;

export const NoneSelection: NoneSelectionItem = {
  type: "none",
  id: ""
};

type Selected = SelectionItem | SelectionItem[] | NoneSelectionItem;

export class SelectionStore {
  selected: Selected = NoneSelection;
  isMultiSelection: boolean = false;

  updateSelection(newSelection: NoneSelectionItem): void;
  updateSelection(newSelection: SelectionItem): void;
  updateSelection(newSelection: SelectionItem[]): void;
  updateSelection(
    newSelection: SelectionItem | SelectionItem[] | NoneSelectionItem
  ): void {
    this.selected = newSelection;
    if (Array.isArray(newSelection)) {
      if (newSelection.length === 0) {
        throw new Error(`Multiselection cann't be empty array`);
      }
      this.isMultiSelection = true;
    }
  }

  reset() {
    this.updateSelection(NoneSelection);
  }

  get hasSelection() {
    if (Array.isArray(this.selected)) {
      return true;
    }

    return this.selected.type !== "none";
  }

  get isMulti() {
    return Array.isArray(this.selected);
  }

  get isSingle() {
    return this.hasSelection && !this.isMulti;
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

    this.updateSelection({ type: "fixture", id });
  }

  constructor() {
    makeAutoObservable(this);
  }
}
