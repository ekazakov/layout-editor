import React from "react";
import { observer } from "mobx-react-lite";
import {
  cursorStore,
  Fixture as RoadFixture,
  Gate as FixtureGage,
  globalSettingsStore,
  roadsStore,
  selectionManagerStore,
  undoManagerStore,
} from "../stores";
import styled from "@emotion/styled";
import { ContextMenu } from "./context-menu";
import { InfoPanel } from "./info-panel";

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
  const selected = selectionManagerStore.isSelected(gate.id);
  return (
    <circle
      key={gate.id}
      data-type="fixture_gate"
      id={gate.id}
      data-fixture-id={fixtureId}
      r={10}
      cx={gate.x}
      cy={gate.y}
      fill="white"
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
  const [showInfo, setShowInfo] = React.useState(false);
  const selected = selectionManagerStore.isSelected(fixture.id);
  const isSingle = selectionManagerStore.selectedCount === 1;

  const menuItems = [
    { title: "Delete", action: () => roadsStore.deleteSelection() },
    {
      title: "Info",
      action: () => {
        setShowInfo(true);
      },
    },
    {
      title: "Rotate 90",
      action: () => alert("Not yet implemented"),
    },
  ];
  const infoItems = {
    id: fixture.id,
    gates: fixture.gateList
      .map((g) => {
        return `${g.id}:${g.connection?.id || "—"}`;
      })
      .join("\n"),
    position: `${fixture.position.x},${fixture.position.y}`,
  };

  const pos = {
    x: fixture.position.x + fixture.size + 15,
    y: fixture.position.y - 15,
  };

  return (
    <g
      onPointerDown={(evt) => {
        setIsDragging(() => true);
        const element = evt.target as HTMLElement;

        element.setPointerCapture(evt.pointerId);
        undoManagerStore.stopTrackingChanges();
      }}
      onPointerUp={(evt) => {
        setIsDragging(() => false);
        const element = evt.target as HTMLElement;
        element.releasePointerCapture(evt.pointerId);
        undoManagerStore.trackUp();
      }}
      onPointerMove={() => {
        if (isDragging) {
          fixture.moveBy(cursorStore.movement);
        }
      }}
    >
      {globalSettingsStore.showFixturesIds && (
        <text
          x={fixture.position.x + fixture.size + 10}
          y={fixture.position.y}
          textAnchor="start"
          style={{ fontSize: 12, pointerEvents: "none" }}
        >
          #{fixture.id} ({fixture.gateList.filter((g) => g.connection).length})
        </text>
      )}
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
          return <Gate key={gate.id} gate={gate} fixtureId={fixture.id} />;
        })}
      </g>
      {selected && isSingle && <ContextMenu position={pos} menuItems={menuItems} />}
      {showInfo && (
        <InfoPanel
          isOpen={showInfo}
          onClose={() => setShowInfo(false)}
          items={infoItems}
          position={pos}
        />
      )}
    </g>
  );
});
