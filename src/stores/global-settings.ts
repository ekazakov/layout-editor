import { makeAutoObservable } from "mobx";

interface Settings {
  showNodesIds: boolean;
  showSegmentsIds: boolean;
  showFixturesIds: boolean;
}

export class GlobalSettings {
  showNodesIds: boolean = false;
  showSegmentsIds: boolean = false;
  showFixturesIds: boolean = false;

  update(settings: Settings) {
    this.showNodesIds = settings.showNodesIds;
    this.showSegmentsIds = settings.showSegmentsIds;
    this.showFixturesIds = settings.showFixturesIds;
  }

  constructor() {
    makeAutoObservable(this);
  }
}
