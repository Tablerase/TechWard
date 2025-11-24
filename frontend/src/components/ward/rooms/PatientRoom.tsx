import { useId } from "react";
import { isUrgentStatus } from "@utils/problemStatus";
import HospitalBed from "../devices/HospitalBed";
import IVStand from "../devices/IVStand";
import {
  HOSPITAL_BED_DIMENSIONS,
  IV_STAND_DIMENSIONS,
} from "../devices/deviceDimensions";

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
  patient?: Patient;
  roomId?: string;
}

const PatientRoom = ({
  className,
  style,
  patient,
  idPrefix = "patient-room",
  roomId,
}: PatientRoomProps) => {
  const width = 480;
  const height = 272;
  const uniqueId = useId();
  const mostUrgent = patient?.problems.find((p) => isUrgentStatus(p.status));

  const floorColor = "var(--color-lavender-100)";
  const floorBorderColor = "var(--color-lavender-300)";
  // Calculate scale factor to fit devices in room
  const BedArea = {
    width: 246,
    height: 181,
    bedHeight: 162,
    bedWidth: 86.41,
    ivStandHeight: 69,
    ivStandWidth: 25,
  };
  const BathRoomArea = {
    width: 234,
    height: 181,
  };
  const CorridorArea = {
    width: 480,
    height: 91,
  };

  const bedScale = BedArea.bedHeight / HOSPITAL_BED_DIMENSIONS.height;
  const ivStandScale = BedArea.ivStandHeight / IV_STAND_DIMENSIONS.height;

  // Position calculations (relative to room coordinate system)
  const bedX =
    BathRoomArea.width +
    BedArea.width / 2 -
    (HOSPITAL_BED_DIMENSIONS.width * bedScale) / 2;
  const bedY =
    BedArea.height / 2 - (HOSPITAL_BED_DIMENSIONS.height * bedScale) / 2;

  const ivStandX = bedX + HOSPITAL_BED_DIMENSIONS.width * bedScale + 20;
  const ivStandY =
    BedArea.height / 2 - (IV_STAND_DIMENSIONS.height * ivStandScale) / 2;

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
        <g id="RoomArea">
          <path
            id="Room"
            d="M476 251V260.5C476 264.918 472.418 268.5 468 268.5H12.5C8.08172 268.5 4.5 264.918 4.5 260.5V12.5C4.5 8.08171 8.08172 4.5 12.5 4.5H468C472.418 4.5 476 8.08172 476 12.5V201.5"
            fill="url(#patientFloorTile)"
            stroke={floorBorderColor}
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Room number */}
          <rect
            x={0 + 20}
            y={height - 48}
            width="50"
            height="30"
            fill="var(--color-background)"
            stroke="var(--color-primary)"
            strokeWidth="2"
            rx="4"
          />
          <text
            x={0 + 45}
            y={height - 26}
            textAnchor="middle"
            fill="var(--color-primary)"
            fontSize="18"
            fontWeight="bold"
          >
            {roomId}
          </text>

          {/* Patient name */}
          <text
            x={CorridorArea.width / 2}
            y={height - CorridorArea.height / 2}
            textAnchor="middle"
            fill="var(--color-base-text)"
            fontSize="16"
            fontWeight="bold"
          >
            {patient?.name || "Empty"}
          </text>
          <g id="BathRoomArea">
            <path
              id="BathRoom"
              d="M150 178H13C8.58172 178 5 174.418 5 170V12C5 7.58172 8.58172 4 13 4H221C225.418 4 229 7.58172 229 12V170C229 174.418 225.418 178 221 178H200"
              stroke={floorBorderColor}
              strokeWidth="8"
              strokeLinecap="round"
            />
          </g>
          <g id="BedArea">
            {/* IV Stand - positioned in upper right area of room */}
            <g
              transform={`translate(${ivStandX}, ${ivStandY}) scale(${ivStandScale})`}
            >
              <IVStand
                tripodColor="var(--color-lavender-400)"
                barColor="var(--color-apricot-300)"
                hookColor="var(--color-neutral-900)"
              />
            </g>

            {/* Hospital Bed - positioned in center/lower area */}
            <g transform={`translate(${bedX}, ${bedY}) scale(${bedScale})`}>
              <HospitalBed
                frameColor="var(--color-lavender-400)"
                mattressColor="var(--color-mustard-300)"
                sheetColor="var(--color-apricot-200)"
                pillowColor="var(--color-neutral-100)"
              />
            </g>
          </g>
        </g>
      </g>
    </svg>
    // <svg
    //   xmlns="http://www.w3.org/2000/svg"
    //   width={width}
    //   height={height}
    //   viewBox={`0 0 ${width} ${height}`}
    //   fill="none"
    //   className={className}
    //   style={style}
    //   aria-labelledby={`${idPrefix}-title`}
    // >
    //   {/* Define patterns and gradients */}
    //   <defs>
    //     <pattern
    //       id="patientFloorTile"
    //       x="0"
    //       y="0"
    //       width="40"
    //       height="40"
    //       patternUnits="userSpaceOnUse"
    //     >
    //       <rect width="40" height="40" fill={floorColor} />
    //       <path
    //         d="M 0 0 L 40 0 L 40 40 L 0 40 Z"
    //         fill="none"
    //         stroke={floorBorderColor}
    //         strokeWidth="1"
    //       />
    //     </pattern>
    //   </defs>
    //   <g id={`${uniqueId}-patient-room-${roomId}`}>
    //

    //     {/* Patient bed icon */}
    //     <g
    //       transform={`translate(${x + width / 2 - 277 / 4}, ${
    //         y + height / 2 - 512 / 4
    //       }) scale(0.5)`}
    //     >
    //       <HospitalBed />
    //     </g>

    //     {/* IV stand icon */}
    //     <g
    //       transform={`translate(${x + 280}, ${
    //         y + height / 2 - 400 / 2.5
    //       }) scale(0.5)`}
    //     >
    //       <IVStand />
    //     </g>

    //     {/* Problem indicators */}
    //     {patient?.problems.map((problem, idx) => (
    //       <g key={problem.id}>
    //         {/* Problem badge */}
    //         <circle
    //           cx={x + width / 2 - 40 + idx * 30}
    //           cy={y + height - 40}
    //           r="12"
    //           fill={getProblemColor(problem.status)}
    //           stroke="var(--color-background)"
    //           strokeWidth="2"
    //         />
    //         {problem.status === "critical" && (
    //           <text
    //             x={x + width / 2 - 40 + idx * 30}
    //             y={y + height - 36}
    //             textAnchor="middle"
    //             fill="var(--color-background)"
    //             fontSize="18"
    //             fontWeight="bold"
    //           >
    //             !
    //           </text>
    //         )}
    //         {problem.assignedTo && (
    //           <text
    //             x={x + width / 2}
    //             y={y + height - 15}
    //             textAnchor="middle"
    //             fill="var(--color-base-text-muted)"
    //             fontSize="12"
    //           >
    //             Assigned: {problem.assignedTo.caregiverName.firstName}
    //           </text>
    //         )}
    //       </g>
    //     ))}

    //     {/* Alert indicator for critical problems */}
    //     {mostUrgent && (
    //       <g>
    //         <circle
    //           cx={x + width - 25}
    //           cy={y + 25}
    //           r="15"
    //           fill={getProblemColor(mostUrgent.status)}
    //           className="animate-pulse"
    //         >
    //           <animate
    //             attributeName="opacity"
    //             values="1;0.5;1"
    //             dur="1.5s"
    //             repeatCount="indefinite"
    //           />
    //         </circle>
    //         <text
    //           x={x + width - 25}
    //           y={y + 30}
    //           textAnchor="middle"
    //           fill="var(--color-background)"
    //           fontSize="20"
    //           fontWeight="bold"
    //         >
    //           !
    //         </text>
    //       </g>
    //     )}
    //   </g>
    // </svg>
  );
};

export default PatientRoom;
