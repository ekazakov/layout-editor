import { SelectableItemType } from "../../../types";

const selectableTypes = ["node", "fixture", "segment", "fixture_gate"];

export function isSelectableItem(type: string): type is SelectableItemType {
  return selectableTypes.includes(type);
}
