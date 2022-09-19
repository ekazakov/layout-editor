import { makeAutoObservable } from "mobx";

interface Settings {
  showNodesIds: boolean;
  showSegmentsIds: boolean;
  showFixturesIds: boolean;
  showSnappingProjections: boolean;
}

export class GlobalSettings {
  _showNodesIds: boolean = false;
  _showSegmentsIds: boolean = false;
  _showFixturesIds: boolean = false;
  _showSnappingProjections: boolean = false;

  update(settings: Settings) {
    this.showNodesIds = settings.showNodesIds;
    this.showSegmentsIds = settings.showSegmentsIds;
    this.showFixturesIds = settings.showFixturesIds;
    this.showSnappingProjections = settings.showSnappingProjections;
  }

  get showNodesIds() {
    return this._showNodesIds;
  }

  set showNodesIds(value) {
    this._showNodesIds = value;
  }

  get showSegmentsIds() {
    return this._showSegmentsIds;
  }

  set showSegmentsIds(value) {
    this._showSegmentsIds = value;
  }

  get showFixturesIds() {
    return this._showFixturesIds;
  }

  set showFixturesIds(value) {
    this._showFixturesIds = value;
  }

  get showSnappingProjections() {
    return this._showSnappingProjections;
  }

  set showSnappingProjections(value) {
    this._showSnappingProjections = value;
  }

  constructor() {
    makeAutoObservable(this);
  }
}
