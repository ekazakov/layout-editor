import { SelectableItemType } from "../../../types";

const selectableTypes = ["node", "fixture", "segment"];

export function isSelectableItem(type: string): type is SelectableItemType {
  return selectableTypes.includes(type);
}
