import { useId } from "react";

interface CaregiverOfficeProps {
  x: number;
  y: number;
  width: number;
  height: number;
}

const CaregiverOffice = ({ x, y, width, height }: CaregiverOfficeProps) => {
  const uniqueId = useId();

  return (
    <g id={`${uniqueId}-caregiver-office`}>
      {/* Room outline */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="var(--color-azure-100)"
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
        📋
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
        Caregiver Office
      </text>

      {/* Room description */}
      <text
        x={x + width / 2}
        y={y + height / 2 + 20}
        textAnchor="middle"
        fill="var(--color-base-text-muted)"
        fontSize="12"
      >
        Administration
      </text>

      {/* Desk */}
      <rect
        x={x + width / 2 - 40}
        y={y + height - 80}
        width="80"
        height="50"
        fill="var(--color-azure-300)"
        stroke="var(--color-primary)"
        strokeWidth="2"
        rx="4"
      />

      {/* Computer */}
      <rect
        x={x + width / 2 - 20}
        y={y + height - 75}
        width="40"
        height="30"
        fill="var(--color-azure-500)"
        stroke="var(--color-primary)"
        strokeWidth="1"
        rx="2"
      />
    </g>
  );
};

export default CaregiverOffice;
