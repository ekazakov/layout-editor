import { useLayer } from "react-laag";
import styled from "@emotion/styled";
import React, { useMemo } from "react";
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
  // renderLayer: any;
  // layerProps: any;
  // triggerProps: any;
  // isOpen: boolean;
  // setOpen: any;
}

export function ContextMenu({ position }: ContextMenuProps) {
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
    <foreignObject width={30} height={30} x={position.x + 15} y={position.y}>
      <MenuButton {...triggerProps} onClick={() => setOpen(true)}>
        +
      </MenuButton>
      {renderLayer(
        <>
          {isOpen && (
            <MenuContainer {...layerProps}>
              <MenuItem>Delete</MenuItem>
              <MenuItem>Show Info</MenuItem>
              <MenuItem>Item 3</MenuItem>
              <MenuItem>Item 4</MenuItem>
            </MenuContainer>
          )}
        </>,
      )}
    </foreignObject>
  );
}

export function useContextMenu() {
  // const [isOpen, setOpen] = React.useState(false);
  //
  // function close() {
  //   setOpen(false);
  // }
  //
  // const { renderLayer, triggerProps, layerProps } = useLayer({
  //   isOpen,
  //   onOutsideClick: close, // close the menu when the user clicks outside
  //   onDisappear: close, // close the menu when the menu gets scrolled out of sight
  //   overflowContainer: false, // keep the menu positioned inside the container
  //   auto: true, // automatically find the best placement
  //   placement: "top-end", // we prefer to place the menu "top-end"
  //   triggerOffset: 1, // keep some distance to the trigger
  //   containerOffset: 1, // give the menu some room to breath relative to the container
  // });
  //
  // return useMemo(() => {
  //   return function ContextMenuWrapper(props: any) {
  //     return (
  //       <ContextMenu
  //         position={props.position}
  //         renderLayer={renderLayer}
  //         layerProps={layerProps}
  //         triggerProps={triggerProps}
  //         isOpen={isOpen}
  //         setOpen={setOpen}
  //       />
  //     );
  //   };
  // }, [renderLayer, layerProps, triggerProps]);
}
