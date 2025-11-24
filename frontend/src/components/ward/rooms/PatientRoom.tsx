import { useId } from "react";
import { getProblemColor, isUrgentStatus } from "@utils/problemStatus";
import HospitalBed from "../devices/HospitalBed";
import IVStand from "../devices/IVStand";

interface Problem {
  id: string;
  description: string;
  status: "critical" | "serious" | "stable" | "resolved" | "processing";
  assignedTo?: {
    caregiverId: string;
    caregiverName: {
      firstName: string;
      lastName: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

interface Patient {
  id: string;
  name: string;
  problems: Problem[];
}

interface PatientRoomProps {
  className?: string;
  style?: React.CSSProperties;
  idPrefix?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  patient?: Patient;
  roomId?: string;
}

const PatientRoom = ({
  className,
  style,
  idPrefix = "patient-room",
  x = 0,
  y = 0,
  width = 400,
  height = 400,
  patient,
  roomId,
}: PatientRoomProps) => {
  const uniqueId = useId();
  const mostUrgent = patient?.problems.find((p) => isUrgentStatus(p.status));
  const floorColor = "var(--color-lavender-100)";
  const floorBorderColor = "var(--color-lavender-300)";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      className={className}
      style={style}
      aria-labelledby={`${idPrefix}-title`}
    >
      {/* Define patterns and gradients */}
      <defs>
        <pattern
          id="patientFloorTile"
          x="0"
          y="0"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <rect width="40" height="40" fill={floorColor} />
          <path
            d="M 0 0 L 40 0 L 40 40 L 0 40 Z"
            fill="none"
            stroke={floorBorderColor}
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <g id={`${uniqueId}-patient-room-${roomId}`}>
        {/* Room outline */}
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill="url(#patientFloorTile)"
          stroke="var(--color-primary)"
          strokeWidth="3"
          rx="8"
        />

        {/* Room number */}
        <rect
          x={x + 10}
          y={y + 10}
          width="50"
          height="30"
          fill="var(--color-background)"
          stroke="var(--color-primary)"
          strokeWidth="2"
          rx="4"
        />
        <text
          x={x + 35}
          y={y + 32}
          textAnchor="middle"
          fill="var(--color-primary)"
          fontSize="18"
          fontWeight="bold"
        >
          {roomId}
        </text>

        {/* Patient name */}
        <text
          x={x + width / 2}
          y={y + 55}
          textAnchor="middle"
          fill="var(--color-base-text)"
          fontSize="16"
          fontWeight="bold"
        >
          {patient?.name || "Empty"}
        </text>

        {/* Patient bed icon */}
        <g
          transform={`translate(${x + width / 2 - 277 / 4}, ${
            y + height / 2 - 512 / 4
          }) scale(0.5)`}
        >
          <HospitalBed />
        </g>

        {/* IV stand icon */}
        <g
          transform={`translate(${x + 280}, ${
            y + height / 2 - 400 / 2.5
          }) scale(0.5)`}
        >
          <IVStand />
        </g>

        {/* Problem indicators */}
        {patient?.problems.map((problem, idx) => (
          <g key={problem.id}>
            {/* Problem badge */}
            <circle
              cx={x + width / 2 - 40 + idx * 30}
              cy={y + height - 40}
              r="12"
              fill={getProblemColor(problem.status)}
              stroke="var(--color-background)"
              strokeWidth="2"
            />
            {problem.status === "critical" && (
              <text
                x={x + width / 2 - 40 + idx * 30}
                y={y + height - 36}
                textAnchor="middle"
                fill="var(--color-background)"
                fontSize="18"
                fontWeight="bold"
              >
                !
              </text>
            )}
            {problem.assignedTo && (
              <text
                x={x + width / 2}
                y={y + height - 15}
                textAnchor="middle"
                fill="var(--color-base-text-muted)"
                fontSize="12"
              >
                Assigned: {problem.assignedTo.caregiverName.firstName}
              </text>
            )}
          </g>
        ))}

        {/* Alert indicator for critical problems */}
        {mostUrgent && (
          <g>
            <circle
              cx={x + width - 25}
              cy={y + 25}
              r="15"
              fill={getProblemColor(mostUrgent.status)}
              className="animate-pulse"
            >
              <animate
                attributeName="opacity"
                values="1;0.5;1"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </circle>
            <text
              x={x + width - 25}
              y={y + 30}
              textAnchor="middle"
              fill="var(--color-background)"
              fontSize="20"
              fontWeight="bold"
            >
              !
            </text>
          </g>
        )}
      </g>
    </svg>
  );
};

export default PatientRoom;
