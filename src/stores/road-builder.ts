import { computed, makeAutoObservable } from "mobx";
import { ItemType, RoadsDump, SelectableItemType } from "../types";
import { SelectionManagerStore } from "./selection/selection-manager";
import { CursorStore } from "./cursor";
import { NodeStore } from "./nodes";
import { SegmentStore } from "./segments";
import { FixturesStore } from "./fixtures";
import { RoadNode } from "./road-node";
import { RoadSegment } from "./road-segment";
import { Fixture } from "./fixture";
import { findHoveredElements, matchElementTypeAtPosition } from "../utils/find-hovered-element";
import { SelectionRect } from "./selection/selection-rect";

type ActionFn = () => boolean;

let version = 0;

export class RoadBuilder {
  private getCurrentElementId() {
    const element = document.elementFromPoint(this.cursor.x, this.cursor.y);

    if (!element?.id) {
      throw Error("Now element found");
    }

    return element.id;
  }

  connectNodes() {
    const nodeId = this.getCurrentElementId();

    if (
      this.selectedNode &&
      this.cursor.metaKey &&
      !this.nodes.isConnected(this.selectedNode.id, nodeId)
    ) {
      this.segments.addSegment(this.selectedNode.id, nodeId);
      return true;
    }

    return false;
  }

  addSegment() {
    if (this.selectedNode && this.cursor.metaKey) {
      const newNode = this.nodes.createNoe(this.cursor.position);
      this.segments.addSegment(this.selectedNode.id, newNode.id);
      this.selection.selectSingleItem(newNode.id);
      return true;
    }

    return false;
  }

  addItemToSelection() {
    const id = this.getCurrentElementId();
    if (!this.cursor.shiftKey) {
      return false;
    }
    this.selection.addItemToSelection(id);
    return true;
  }

  selectItem() {
    const id = this.getCurrentElementId();
    this.selection.selectSingleItem(id);
    return true;
  }

  splitSegment() {
    const id = this.getCurrentElementId();
    if (!this.selectedNode && this.cursor.altKey) {
      this.segments.splitSegmentAt(id, this.cursor.position);
      return true;
    }

    return false;
  }

  connectNodeToSegment() {
    const id = this.getCurrentElementId();
    if (this.selectedNode && this.cursor.metaKey) {
      const node = this.segments.splitSegmentAt(id, this.cursor.position);

      this.segments.addSegment(this.selectedNode.id, node.id);
      return true;
    }

    return false;
  }

  connectSegmentToFixture() {
    const id = this.getCurrentElementId();
    if (this.selectedNode && this.cursor.metaKey) {
      const newNode = this.nodes.createNoe(this.cursor.position);
      this.segments.addSegment(this.selectedNode.id, newNode.id);
      this.selection.selectSingleItem(id);
      this.fixtures.connectToGate(id, newNode);
      return true;
    }

    return false;
  }

  connectFixtureToFixture() {
    const id = this.getCurrentElementId();
    if (this.selectedGate && this.cursor.metaKey && this.selectedGate.id !== id) {
      const startNode = this.nodes.createNoe(this.selectedGate.position);
      const endNode = this.nodes.createNoe(this.cursor.position);
      this.segments.addSegment(startNode.id, endNode.id);
      this.fixtures.connectToGate(id, endNode);
      this.fixtures.connectToGate(this.selectedGate.id, startNode);
      this.selection.selectSingleItem(endNode.id);
      return true;
    }

    return false;
  }

  toggleItemInSelection() {
    if (this.cursor.shiftKey) {
      const els = findHoveredElements(this.cursor.position);
      const types = ["road-node", "road-segment", "fixture"];
      const item = els.find(({ dataset: { type } }) => types.includes(type ?? ""));
      if (item) {
        if (this.selection.isSelected(item.id)) {
          this.selection.removeItemFromSelection(item.id);
        } else {
          this.selection.addItemToSelection(item.id);
        }
        return true;
      }
    }
    return false;
  }

  startMultiSelection() {
    if (this.cursor.noKeys || this.cursor.shiftKey) {
      this.selectionRect.setStart(this.cursor.position);
      return true;
    }

    return false;
  }

  updateSegmentIntersectionsAndSnaps() {
    const selectedItem = this.selectedNode || this.selectedGate;
    if (selectedItem && this.cursor.metaKey) {
      const line = {
        start: selectedItem,
        end: this.cursor.position,
      };
      this.segments.updateIntersectionsWithRoad(line);
      this.segments.updateSnapPoints(this.cursor.position);
      return true;
    }

    return false;
  }

  updateGateSnaps() {
    if (this.selectedNode && this.cursor.isLeftButtonPressed) {
      this.fixtures.updateSnapGates(this.selectedNode.id);
      return true;
    }
    return false;
  }

  finishMultiSelection() {
    if (this.selectionRect.inProgress) {
      this.selectionRect.setEnd(this.cursor.position);
      this.selection.selectionFromAria(this.selectionRect.rect, this.cursor.shiftKey);
      this.selectionRect.reset();
      return true;
    }

    return false;
  }

  addFixture() {
    if (this.cursor.altKey && this.cursor.shiftKey) {
      const newFixture = this.fixtures.addFixture(this.cursor.position);
      this.selection.selectSingleItem(newFixture.id);
      return true;
    }
    return false;
  }

  addNode() {
    if (this.cursor.altKey) {
      const newNode = this.nodes.createNoe(this.cursor.position);
      this.selection.selectSingleItem(newNode.id);
      return true;
    }
    return false;
  }

  connectNodeToSegmentWithSnapping() {
    if (this.selectedNode && this.cursor.metaKey && this.cursor.isSnapped) {
      const element = matchElementTypeAtPosition(this.cursor.snapPosition, "road-segment");
      if (element?.id) {
        const node = this.segments.splitSegmentAt(element.id, this.cursor.snapPosition);
        this.segments.addSegment(this.selectedNode.id, node.id);
      }
      return true;
    }

    return false;
  }

  addSegmentFromGate() {
    if (this.selectedGate && this.cursor.metaKey) {
      const newNode = this.nodes.createNoe(this.cursor.position);
      const startNode = this.nodes.createNoe(this.selectedGate.position);
      this.fixtures.connectToGate(this.selectedGate.id, startNode);
      this.segments.addSegment(startNode.id, newNode.id);
      this.selection.selectSingleItem(newNode.id);
      return true;
    }

    return false;
  }

  matchAction(actions: ActionFn[]) {
    for (let i = 0; i < actions.length; i++) {
      const result = actions[i]();
      if (result) {
        return;
      }
    }
  }

  populate(dump: RoadsDump) {
    this.empty();
    dump.nodes.forEach((dump) => {
      const node = RoadNode.populate(dump);
      this.nodes.set(node.id, node);
    });
    dump.segments.forEach((dump) => {
      const nodeStart = this.nodes.getNode(dump.startNodeId)!;
      const nodeEnd = this.nodes.getNode(dump.endNodeId)!;
      const segment = new RoadSegment(nodeStart, nodeEnd, dump.id);
      this.segments.set(segment.id, segment);
    });
    dump.fixtures.forEach((dump) => {
      const fixture = Fixture.populate(dump, this.nodes);
      this.fixtures.set(fixture.id, fixture);
    });
  }

  private getSelectedItemId(type: ItemType) {
    return this.selection.getSingleSelection(type);
  }

  get selectedNode() {
    return this.nodes.getNode(this.getSelectedItemId("node"));
  }

  get selectedGate() {
    return this.fixtures.getGate(this.getSelectedItemId("fixture_gate"));
  }

  private deleteItem(id: string, type: SelectableItemType) {
    switch (type) {
      case "fixture":
        return this.fixtures.deleteFixture(id);
      case "node":
        return this.nodes.deleteNode(id);
      case "segment":
        return this.segments.deleteSegment(id);
      default:
        return false;
    }
  }

  deleteSelection() {
    this.selection.list.forEach((item) => {
      this.deleteItem(item.id, item.type);
    });
  }

  empty() {
    this.nodes.clear();
    this.segments.clear();
    this.fixtures.clear();

    this.selection.reset();
  }

  get toJSON() {
    return {
      version: version++,
      nodes: this.nodes.list.map((value) => value.toJSON),
      segments: this.segments.list.map((value) => value.toJSON),
      fixtures: this.fixtures.list.map((value) => value.toJSON),
    } as RoadsDump;
  }

  private initReactions() {}

  constructor(
    private readonly selection: SelectionManagerStore,
    private readonly cursor: CursorStore,
    private readonly nodes: NodeStore,
    private readonly segments: SegmentStore,
    private readonly fixtures: FixturesStore,
    private readonly selectionRect: SelectionRect,
  ) {
    makeAutoObservable(
      this,
      {
        toJSON: computed({ keepAlive: true }),
      },
      { autoBind: true },
    );
  }
}
