import styled from "@emotion/styled";

const Tick = styled.line`
  stroke-width: 1;
  stroke: red;
`;

interface ScaleProps {
  direction: "vertical" | "horizontal";
  max: number;
  step?: number;
}

export function Scale(props: ScaleProps) {
  const { max, step = 100, direction } = props;
  const count = Math.floor(max / step);
  const steps = new Array(count + 1).fill(0).map((_, index) => step * index);

  if (direction === "horizontal") {
    return (
      <g>
        {steps.map((n) => {
          return (
            <g key={n}>
              <Tick x1={n} y1={0} x2={n} y2={10} />
              <text x={n} y={20} textAnchor="start">
                {n}
              </text>
            </g>
          );
        })}
      </g>
    );
  }

  return (
    <g>
      {steps.map((n) => {
        return (
          <g key={n}>
            <Tick x1={0} y1={n} x2={10} y2={n} />
            <text x={20} y={n} textAnchor="start">
              {n}
            </text>
          </g>
        );
      })}
    </g>
  );
}
