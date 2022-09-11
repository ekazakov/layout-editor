import styled from "@emotion/styled";
import { useState } from "react";

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

export function Help() {
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
      </HelpExpanded>
    </HelpContainer>
  );
}
