import { makeAutoObservable } from "mobx";

interface Settings {
  showNodesIds: boolean;
  showSegmentsIds: boolean;
  showFixturesIds: boolean;
  showSnappingProjections: boolean;
}

export class GlobalSettings {
  showNodesIds: boolean = false;
  showSegmentsIds: boolean = false;
  showFixturesIds: boolean = false;
  showSnappingProjections: boolean = false;

  update(settings: Settings) {
    this.showNodesIds = settings.showNodesIds;
    this.showSegmentsIds = settings.showSegmentsIds;
    this.showFixturesIds = settings.showFixturesIds;
    this.showSnappingProjections = settings.showSnappingProjections;
  }

  constructor() {
    makeAutoObservable(this);
  }
}
