import React from "react";
import { observer } from "mobx-react-lite";
import {
  Fixture as RoadFixture,
  Gate as FixtureGage,
  selectionStore
} from "../stores";
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

interface GateProps {
  fixtureId: string;
  gate: FixtureGage;
}

const Gate = observer(function Gate(props: GateProps) {
  const { gate, fixtureId } = props;
  const selected = gate.id === selectionStore.gateId;
  return (
    <circle
      key={gate.id}
      data-type="fixture-gate"
      id={gate.id}
      data-fixture-id={fixtureId}
      r={10}
      cx={gate.x}
      cy={gate.y}
      fill="white"
      // stroke={strokeColor}
      stroke={selected ? "orange" : strokeColor}
      strokeWidth="2px"
    />
  );
});

interface FixtureProps {
  fixture: RoadFixture;
}

export const Fixture = observer(function Fixture({ fixture }: FixtureProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const selected = fixture.id === selectionStore.fixtureId;

  return (
    <g
      onPointerDown={(evt) => {
        setIsDragging(() => true);
        const element = evt.target as HTMLElement;

        element.setPointerCapture(evt.pointerId);
      }}
      onPointerUp={(evt) => {
        setIsDragging(() => false);
        const element = evt.target as HTMLElement;
        element.releasePointerCapture(evt.pointerId);
      }}
      onPointerMove={(evt) => {
        if (isDragging) {
          fixture.moveBy({
            x: Math.round(evt.movementX),
            y: Math.round(evt.movementY)
          });
        }
      }}
    >
      <StyledRect
        selected={selected}
        id={fixture.id}
        data-type="fixture"
        x={fixture.x}
        y={fixture.y}
        width={fixture.size}
        height={fixture.size}
      />
      <g>
        {fixture.gateList.map((gate) => {
          return (
            <Gate
              key={gate.id}
              gate={gate}
              fixtureId={fixture.id}
              // data-type="fixture-gate"
              // id={gate.id}
              // data-fixture-id={fixture.id}
              // r={10}
              // cx={gate.x}
              // cy={gate.y}
              // fill="white"
              // stroke={strokeColor}
              // strokeWidth="2px"
            />
          );
        })}
      </g>
    </g>
  );
});
