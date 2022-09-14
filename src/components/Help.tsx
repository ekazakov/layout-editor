import styled from "@emotion/styled";
import { useState } from "react";
import { observer } from "mobx-react-lite";
import { globalSettingsStore as gs } from "../stores";

const HelpContainer = styled.div`
  position: fixed;
  top: 50px;
  right: 50px;
`;

const HelpPreview = styled.div`
  height: 30px;
  width: 30px;
  background-color: #fff;
  border-radius: 50%;
  box-shadow: 1px 1px 2px 1px rgb(0 0 0 / 50%);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;

  &:after {
    content: "?";
  }
`;

const Label = styled.label`
  display: block;
`;

const HelpExpanded = styled.div`
  background: #fff;
  width: 300px;
  min-height: 100px;
  position: relative;
  padding: 10px;
  font-family: monospace;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
`;

export const Help = observer(function Help() {
  const [expanded, setExpanded] = useState(false);

  if (!expanded) {
    return (
      <HelpContainer>
        <HelpPreview onClick={() => setExpanded(true)} />
      </HelpContainer>
    );
  }

  return (
    <HelpContainer>
      <HelpExpanded>
        <CloseButton onClick={() => setExpanded(false)}>x</CloseButton>
        <div>
          <p>Add node: Alt+Click</p>
          <p>Add fixture: Alt+Shift+Click</p>
          <p>Split segment: Alt+Click</p>
          <p>Multiselect: MouseDown and drag</p>
          <p>Add item to selection: Shift+Click</p>
          <p>Build segment: Select node and press Cmd</p>
        </div>
        <div>
          <Label>
            <span>Nodes IDs:</span>
            <input
              type="checkbox"
              onChange={({ target }) => (gs.showNodesIds = target.checked)}
              checked={gs.showNodesIds}
            />
          </Label>
          <Label>
            <span>Segments IDs:</span>
            <input
              type="checkbox"
              onChange={({ target }) => (gs.showSegmentsIds = target.checked)}
              checked={gs.showSegmentsIds}
            />
          </Label>
          <Label>
            <span>Fixtures IDs:</span>
            <input
              type="checkbox"
              onChange={({ target }) => (gs.showFixturesIds = target.checked)}
              checked={gs.showFixturesIds}
            />
          </Label>
          <Label>
            <span>Snapping Projections:</span>
            <input
              type="checkbox"
              onChange={({ target }) => (gs.showSnappingProjections = target.checked)}
              checked={gs.showSnappingProjections}
            />
          </Label>
        </div>
      </HelpExpanded>
    </HelpContainer>
  );
});
