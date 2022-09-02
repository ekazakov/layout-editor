import { SelectableItemType } from "../../types";
import { makeAutoObservable } from "mobx";
import { isSelectableItem } from "./utils/is-selectable-item";

export class SingleItem {
  private readonly _type: SelectableItemType;
  private readonly _id: string;

  isSelected(id: string) {
    return this._id === id;
  }

  get type() {
    return this._type;
  }

  get id() {
    return this._id;
  }

  constructor(id: string) {
    const [type] = id.split("#");
    if (!isSelectableItem(type)) {
      throw new Error(`Type ${type} doesn't match to id ${id}`);
    }
    this._id = id;
    this._type = type;
    makeAutoObservable(this);
  }
}
