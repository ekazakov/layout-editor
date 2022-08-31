import { ItemType } from "../../types";
import { makeAutoObservable } from "mobx";

export class SingleItem {
  private readonly _type: ItemType | undefined = undefined;
  private readonly _id: string | undefined = undefined;

  isSelected(id: string) {
    return this._id === id;
  }

  get type() {
    return this._type;
  }

  get id() {
    return this._id;
  }

  private validate(id: string, type: ItemType) {
    if (id.length === 0) {
      throw new Error(`Id couldn't be empty`);
    }

    if (!id.startsWith(type)) {
      throw new Error(`Type ${type} doesn't match to id ${id}`);
    }
  }

  constructor(id: string, type: ItemType) {
    this.validate(id, type);
    this._id = id;
    this._type = type;
    makeAutoObservable(this);
  }
}
