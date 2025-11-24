import { useId } from "react";

interface StorageRoomProps {
  x: number;
  y: number;
  width: number;
  height: number;
}

const StorageRoom = ({ x, y, width, height }: StorageRoomProps) => {
  const uniqueId = useId();

  return (
    <g id={`${uniqueId}-storage-room`}>
      {/* Room outline */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="var(--color-mustard-100)"
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
        📦
      </text>

      {/* Room name */}
      <text
        x={x + width / 2}
        y={y + 38}
        textAnchor="middle"
        fill="var(--color-base-text)"
        fontSize="16"
        fontWeight="bold"
      >
        Storage Room
      </text>

      {/* Room description */}
      <text
        x={x + width / 2}
        y={y + height / 2 + 20}
        textAnchor="middle"
        fill="var(--color-base-text-muted)"
        fontSize="12"
      >
        Medical Supplies
      </text>

      {/* Shelves */}
      <rect
        x={x + 20}
        y={y + height - 100}
        width="60"
        height="8"
        fill="var(--color-mustard-400)"
        rx="2"
      />
      <rect
        x={x + 20}
        y={y + height - 70}
        width="60"
        height="8"
        fill="var(--color-mustard-400)"
        rx="2"
      />

      {/* Boxes */}
      <rect
        x={x + width - 80}
        y={y + height - 80}
        width="25"
        height="25"
        fill="var(--color-mustard-300)"
        stroke="var(--color-primary)"
        strokeWidth="1"
        rx="2"
      />
      <rect
        x={x + width - 50}
        y={y + height - 80}
        width="25"
        height="25"
        fill="var(--color-mustard-300)"
        stroke="var(--color-primary)"
        strokeWidth="1"
        rx="2"
      />
    </g>
  );
};

export default StorageRoom;
