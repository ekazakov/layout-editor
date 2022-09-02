import { RoadsDump } from "../types";

export const dump = {
  nodes: [
    {
      id: "node#WKsi-W-",
      position: {
        x: 502,
        y: 179,
      },
      segmentIds: ["segment#-0TvklC"],
    },
    {
      id: "node#rwLbxdS",
      position: {
        x: 695,
        y: 316,
      },
      segmentIds: ["segment#-0TvklC", "segment#MKHDD8u"],
    },
    {
      id: "node#GVr457s",
      position: {
        x: 773,
        y: 522,
      },
      segmentIds: ["segment#MKHDD8u", "segment#JiMUgl-"],
    },
    {
      id: "node#YaPfNzr",
      position: {
        x: 776,
        y: 699,
      },
      segmentIds: ["segment#JiMUgl-"],
      gateId: "fixture#gate#2bXB2Aa",
    },
    {
      id: "node#C62AQxe",
      position: {
        x: 200,
        y: 722,
      },
      segmentIds: ["segment#9-RLIhh", "segment#5WT4Y-0"],
    },
    {
      id: "node#PiDQVrn",
      position: {
        x: 175,
        y: 250,
      },
      segmentIds: ["segment#9-RLIhh"],
      gateId: "fixture#gate#EN4Zzej",
    },
    {
      id: "node#oWw0CMT",
      position: {
        x: 699,
        y: 774,
      },
      segmentIds: ["segment#5WT4Y-0"],
      gateId: "fixture#gate#zJuMDVM",
    },
  ],
  segments: [
    {
      id: "segment#-0TvklC",
      startNodeId: "node#rwLbxdS",
      endNodeId: "node#WKsi-W-",
    },
    {
      id: "segment#MKHDD8u",
      startNodeId: "node#GVr457s",
      endNodeId: "node#rwLbxdS",
    },
    {
      id: "segment#JiMUgl-",
      startNodeId: "node#YaPfNzr",
      endNodeId: "node#GVr457s",
    },
    {
      id: "segment#9-RLIhh",
      startNodeId: "node#C62AQxe",
      endNodeId: "node#PiDQVrn",
    },
    {
      id: "segment#5WT4Y-0",
      startNodeId: "node#oWw0CMT",
      endNodeId: "node#C62AQxe",
    },
  ],
  fixtures: [
    {
      id: "fixture#9wMKgMU",
      position: {
        x: 100,
        y: 100,
      },
      size: 150,
      gates: [
        {
          id: "fixture#gate#5wugnGU",
          position: {
            x: 100,
            y: 175,
          },
          connectionId: null,
        },
        {
          id: "fixture#gate#fGFsaGO",
          position: {
            x: 250,
            y: 175,
          },
          connectionId: null,
        },
        {
          id: "fixture#gate#lkh_QkH",
          position: {
            x: 175,
            y: 100,
          },
          connectionId: null,
        },
        {
          id: "fixture#gate#EN4Zzej",
          position: {
            x: 175,
            y: 250,
          },
          connectionId: "node#PiDQVrn",
        },
      ],
    },
    {
      id: "fixture#4DpYlzO",
      position: {
        x: 700,
        y: 700,
      },
      size: 150,
      gates: [
        {
          id: "fixture#gate#zJuMDVM",
          position: {
            x: 700,
            y: 775,
          },
          connectionId: "node#oWw0CMT",
        },
        {
          id: "fixture#gate#J6NtUDD",
          position: {
            x: 850,
            y: 775,
          },
          connectionId: null,
        },
        {
          id: "fixture#gate#2bXB2Aa",
          position: {
            x: 775,
            y: 700,
          },
          connectionId: "node#YaPfNzr",
        },
        {
          id: "fixture#gate#P17oNIP",
          position: {
            x: 775,
            y: 850,
          },
          connectionId: null,
        },
      ],
    },
  ],
} as RoadsDump;
