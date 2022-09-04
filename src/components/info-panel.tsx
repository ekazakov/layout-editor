import React from "react";

import styled from "@emotion/styled";
import { Position } from "../types";

const InfoPanelContainer = styled.div`
  border-radius: 5px;
  background-color: #fff;
  box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.6);
  padding: 20px;
  max-width: 200px;
  position: relative;

  table {
    background: none;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
`;

interface InfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
  position: Position;
  items: Record<string, any>;
}

export function InfoPanel({ position, items, isOpen, onClose }: InfoPanelProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <foreignObject x={position.x} y={position.y} width={300} height={200}>
      <InfoPanelContainer>
        <CloseButton onClick={() => onClose()}>x</CloseButton>
        <code>
          <table>
            <tbody>
              {Object.entries(items).map(([key, value]) => {
                return (
                  <tr key={key}>
                    <td>{key}:</td>
                    <td>{value}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </code>
      </InfoPanelContainer>
    </foreignObject>
  );
}

//      <tr>
//                 <td>id</td>
//                 <td>{node.id}</td>
//               </tr>
//               <tr>
//                 <td>segments</td>
//                 <td>{node.segmentIds.size}</td>
//               </tr>
//               <tr>
//                 <td>position</td>
//                 <td>
//                   {node.position.x},{node.position.y}
//                 </td>
//               </tr>
//               <tr>
//                 <td>gateId</td>
//                 <td>{node.gateId}</td>
//               </tr>
