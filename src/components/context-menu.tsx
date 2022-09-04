import { useLayer } from "react-laag";
import styled from "@emotion/styled";
import React from "react";
import { Position } from "../types";

const MenuButton = styled.button`
  border: 1px solid #eee;
  background-color: white;
  appearance: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  font-size: 29px;
  line-height: 30px;
  padding: 0;
  margin: 0;
`;

const MenuContainer = styled.div`
  background-color: #fff;
  font-family: sans-serif;
  min-width: 120px;
`;

const MenuItem = styled.div`
  padding: 10px;
`;

interface ContextMenuProps {
  position: Position;
  menuItems: Array<{ title: string; action: (...args: any[]) => void }>;
}

export function ContextMenu({ position, menuItems }: ContextMenuProps) {
  const [isOpen, setOpen] = React.useState(false);

  function close() {
    setOpen(false);
  }

  const { renderLayer, triggerProps, layerProps } = useLayer({
    isOpen,
    onOutsideClick: close, // close the menu when the user clicks outside
    onDisappear: close, // close the menu when the menu gets scrolled out of sight
    overflowContainer: false, // keep the menu positioned inside the container
    auto: true, // automatically find the best placement
    placement: "top-end", // we prefer to place the menu "top-end"
    triggerOffset: 1, // keep some distance to the trigger
    containerOffset: 1, // give the menu some room to breath relative to the container
  });

  return (
    <foreignObject width={30} height={30} x={position.x} y={position.y}>
      <MenuButton {...triggerProps} onClick={() => setOpen(true)}>
        +
      </MenuButton>
      {renderLayer(
        <>
          {isOpen && (
            <MenuContainer {...layerProps}>
              {menuItems.map((item) => {
                return (
                  <MenuItem
                    key={item.title}
                    onClick={(evt) => {
                      item.action(evt);
                      close();
                    }}
                  >
                    {item.title}
                  </MenuItem>
                );
              })}
            </MenuContainer>
          )}
        </>,
      )}
    </foreignObject>
  );
}
