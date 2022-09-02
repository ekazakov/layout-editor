import { Item, ItemType, SelectableItemType } from "../../../types";
import { RoadNode } from "../../road-node";
import { RoadSegment } from "../../road-segment";
import { Fixture } from "../../fixture";
import { isSelectableItem } from "./is-selectable-item";

export function getItemType(id: string): SelectableItemType {
  const [type] = id.split("#");

  if (!isSelectableItem(type)) {
    throw Error(`ItemType ${type} is not selectable`);
  }

  return type;
}
