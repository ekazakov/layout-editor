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
        x: 775,
        y: 700,
      },
      segmentIds: ["segment#JiMUgl-"],
      gateId: "fixture_gate#2bXB2Aa",
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
      gateId: "fixture_gate#EN4Zzej",
    },
    {
      id: "node#oWw0CMT",
      position: {
        x: 700,
        y: 775,
      },
      segmentIds: ["segment#5WT4Y-0"],
      gateId: "fixture_gate#zJuMDVM",
    },
    {
      id: "node#1aN0o7c",
      position: {
        x: 367,
        y: 269,
      },
      segmentIds: ["segment#G_bKmdh"],
    },
    {
      id: "node#Ap0dCIL",
      position: {
        x: 648,
        y: 469,
      },
      segmentIds: ["segment#G_bKmdh", "segment#kzgPZU-"],
    },
    {
      id: "node#hOTEbgH",
      position: {
        x: 299,
        y: 454,
      },
      segmentIds: ["segment#kzgPZU-"],
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
    {
      id: "segment#G_bKmdh",
      startNodeId: "node#Ap0dCIL",
      endNodeId: "node#1aN0o7c",
    },
    {
      id: "segment#kzgPZU-",
      startNodeId: "node#hOTEbgH",
      endNodeId: "node#Ap0dCIL",
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
          id: "fixture_gate#5wugnGU",
          position: {
            x: 100,
            y: 175,
          },
          connectionId: null,
        },
        {
          id: "fixture_gate#fGFsaGO",
          position: {
            x: 250,
            y: 175,
          },
          connectionId: null,
        },
        {
          id: "fixture_gate#lkh_QkH",
          position: {
            x: 175,
            y: 100,
          },
          connectionId: null,
        },
        {
          id: "fixture_gate#EN4Zzej",
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
          id: "fixture_gate#zJuMDVM",
          position: {
            x: 700,
            y: 775,
          },
          connectionId: "node#oWw0CMT",
        },
        {
          id: "fixture_gate#J6NtUDD",
          position: {
            x: 850,
            y: 775,
          },
          connectionId: null,
        },
        {
          id: "fixture_gate#2bXB2Aa",
          position: {
            x: 775,
            y: 700,
          },
          connectionId: "node#YaPfNzr",
        },
        {
          id: "fixture_gate#P17oNIP",
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
