import { useId } from "react";

interface BreakRoomProps {
  x: number;
  y: number;
  width: number;
  height: number;
}

const BreakRoom = ({ x, y, width, height }: BreakRoomProps) => {
  const uniqueId = useId();

  return (
    <g id={`${uniqueId}-break-room`}>
      {/* Room outline */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="var(--color-apricot-100)"
        stroke="var(--color-primary)"
        strokeWidth="3"
        rx="8"
      />

      {/* Room label background */}
      <rect
        x={x + 10}
        y={y + 10}
        width={width - 20}
        height="40"
        fill="var(--color-background)"
        stroke="var(--color-primary)"
        strokeWidth="2"
        rx="6"
        opacity="0.95"
      />

      {/* Room icon */}
      <text x={x + 35} y={y + 40} fontSize="24">
        ☕
      </text>

      {/* Room name */}
      <text
        x={x + width / 2}
        y={y + 38}
        textAnchor="middle"
        fill="var(--color-base-text)"
        fontSize="16"
        fontWeight="bold"
        fontFamily="var(--font-display)"
      >
        Break Room
      </text>

      {/* Room description */}
      <text
        x={x + width / 2}
        y={y + height / 2 + 20}
        textAnchor="middle"
        fill="var(--color-base-text-muted)"
        fontSize="12"
      >
        Rest & Refresh
      </text>

      {/* Table */}
      <rect
        x={x + width / 2 - 30}
        y={y + height - 80}
        width="60"
        height="40"
        fill="var(--color-apricot-300)"
        stroke="var(--color-primary)"
        strokeWidth="2"
        rx="4"
      />

      {/* Chair */}
      <rect
        x={x + width / 2 - 15}
        y={y + height - 50}
        width="30"
        height="8"
        fill="var(--color-apricot-400)"
        rx="2"
      />
    </g>
  );
};

export default BreakRoom;
