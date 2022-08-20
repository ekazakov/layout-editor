import { RoadsDump } from "../types";

export const dump = {
  nodes: [
    {
      id: "node_WKsi-W-",
      position: {
        x: 502,
        y: 179
      },
      segmentIds: ["segment_-0TvklC"]
    },
    {
      id: "node_rwLbxdS",
      position: {
        x: 695,
        y: 316
      },
      segmentIds: ["segment_-0TvklC", "segment_MKHDD8u"]
    },
    {
      id: "node_GVr457s",
      position: {
        x: 773,
        y: 522
      },
      segmentIds: ["segment_MKHDD8u", "segment_JiMUgl-"]
    },
    {
      id: "node_YaPfNzr",
      position: {
        x: 776,
        y: 699
      },
      segmentIds: ["segment_JiMUgl-"],
      gateId: "fixture_gate_2bXB2Aa"
    },
    {
      id: "node_C62AQxe",
      position: {
        x: 200,
        y: 722
      },
      segmentIds: ["segment_9-RLIhh", "segment_5WT4Y-0"]
    },
    {
      id: "node_PiDQVrn",
      position: {
        x: 175,
        y: 250
      },
      segmentIds: ["segment_9-RLIhh"],
      gateId: "fixture_gate_EN4Zzej"
    },
    {
      id: "node_oWw0CMT",
      position: {
        x: 699,
        y: 774
      },
      segmentIds: ["segment_5WT4Y-0"],
      gateId: "fixture_gate_zJuMDVM"
    }
  ],
  segments: [
    {
      id: "segment_-0TvklC",
      startNodeId: "node_rwLbxdS",
      endNodeId: "node_WKsi-W-"
    },
    {
      id: "segment_MKHDD8u",
      startNodeId: "node_GVr457s",
      endNodeId: "node_rwLbxdS"
    },
    {
      id: "segment_JiMUgl-",
      startNodeId: "node_YaPfNzr",
      endNodeId: "node_GVr457s"
    },
    {
      id: "segment_9-RLIhh",
      startNodeId: "node_C62AQxe",
      endNodeId: "node_PiDQVrn"
    },
    {
      id: "segment_5WT4Y-0",
      startNodeId: "node_oWw0CMT",
      endNodeId: "node_C62AQxe"
    }
  ],
  fixtures: [
    {
      id: "fixture_9wMKgMU",
      position: {
        x: 100,
        y: 100
      },
      size: 150,
      gates: [
        {
          id: "fixture_gate_5wugnGU",
          position: {
            x: 100,
            y: 175
          },
          connectionId: null
        },
        {
          id: "fixture_gate_fGFsaGO",
          position: {
            x: 250,
            y: 175
          },
          connectionId: null
        },
        {
          id: "fixture_gate_lkh_QkH",
          position: {
            x: 175,
            y: 100
          },
          connectionId: null
        },
        {
          id: "fixture_gate_EN4Zzej",
          position: {
            x: 175,
            y: 250
          },
          connectionId: "node_PiDQVrn"
        }
      ]
    },
    {
      id: "fixture_4DpYlzO",
      position: {
        x: 700,
        y: 700
      },
      size: 150,
      gates: [
        {
          id: "fixture_gate_zJuMDVM",
          position: {
            x: 700,
            y: 775
          },
          connectionId: "node_oWw0CMT"
        },
        {
          id: "fixture_gate_J6NtUDD",
          position: {
            x: 850,
            y: 775
          },
          connectionId: null
        },
        {
          id: "fixture_gate_2bXB2Aa",
          position: {
            x: 775,
            y: 700
          },
          connectionId: "node_YaPfNzr"
        },
        {
          id: "fixture_gate_P17oNIP",
          position: {
            x: 775,
            y: 850
          },
          connectionId: null
        }
      ]
    }
  ]
} as RoadsDump;
