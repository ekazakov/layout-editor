import {Item, ItemType} from "../../../types";
import {RoadNode} from "../../road-node";
import {RoadSegment} from "../../road-segment";
import {Fixture} from "../../fixture";

export function getItemType(item: Item): ItemType {
    if (item instanceof RoadNode) {
        return "node";
    }
    if (item instanceof RoadSegment) {
        return "segment";
    }
    if (item instanceof Fixture) {
        return "fixture";
    }

    return "fixture_gate";
}
