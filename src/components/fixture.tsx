import React from "react";
import { observer } from "mobx-react-lite";
import styled from "@emotion/styled";

const strokeColor = "#212121";
const StyledRect = styled.rect<{ selected: boolean }>`
  fill: white;
  fill-opacity: 0.01;
  stroke: ${({ selected }) => (selected ? "orange" : strokeColor)};
  stroke-width: 2;
  rx: 5;

  &:hover {
    stroke: ${({ selected }) => (selected ? "orange" : "blue")};
  }
`;

const pos = {
  x: 150,
  y: 150
};

const dimensions = {
  width: 150,
  height: 150
};

export const Fixture = observer(function Fixture() {
  return (
    <g>
      <StyledRect
        selected={false}
        id="fixtureId"
        data-type="fixture"
        x={pos.x}
        y={pos.y}
        width={dimensions.width}
        height={dimensions.height}
      />
      <g>
        <circle
          data-type="fixture-gate"
          r={10}
          cx={pos.x}
          cy={pos.y + dimensions.height / 2}
          fill="white"
          stroke={strokeColor}
          strokeWidth="2px"
        />
        <circle
          data-type="fixture-gate"
          r={10}
          cx={pos.x + dimensions.width}
          cy={pos.y + dimensions.height / 2}
          fill="white"
          stroke={strokeColor}
          strokeWidth="2px"
        />
        <circle
          data-type="fixture-gate"
          r={10}
          cx={pos.x + dimensions.width / 2}
          cy={pos.y}
          fill="white"
          stroke={strokeColor}
          strokeWidth="2px"
        />
        <circle
          data-type="fixture-gate"
          r={10}
          cx={pos.x + dimensions.width / 2}
          cy={pos.y + dimensions.height}
          fill="white"
          stroke={strokeColor}
          strokeWidth="2px"
        />
      </g>
    </g>
  );
});
