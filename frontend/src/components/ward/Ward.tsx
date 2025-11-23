import { useEffect, useRef, useState, useMemo } from "react";
import { useWardSocket } from "@context/WardSocketContext";
import { getProblemColor, isUrgentStatus } from "@utils/problemStatus";
import HospitalBed from "./devices/HospitalBed";

interface RoomLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  patientId: string;
  patientName: string;
}

interface CaregiverPosition {
  caregiverId: string;
  name: string;
  x: number;
  y: number;
  isMoving: boolean;
  assignedRoom?: string;
}

const Ward = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const { wardPatients, caregiverInfo, lastProblemUpdate } = useWardSocket();
  const [caregivers, setCaregivers] = useState<Map<string, CaregiverPosition>>(
    new Map()
  );

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({ width: clientWidth, height: clientHeight });
      }
    };

    // Initial measurement
    updateDimensions();

    // Observe resize
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Calculate room layouts based on number of patients
  const roomLayouts: RoomLayout[] = useMemo(() => {
    if (!wardPatients?.patients) return [];

    const padding = 40;
    const hallwayWidth = 120;
    const roomsPerSide = Math.ceil(wardPatients.patients.length / 2);
    const roomWidth = (dimensions.width - hallwayWidth - padding * 2) / 2;
    const roomHeight = (dimensions.height - padding * 2) / roomsPerSide;

    const layouts: RoomLayout[] = [];

    wardPatients.patients.forEach((patient, index) => {
      const isLeftSide = index % 2 === 0;
      const rowIndex = Math.floor(index / 2);

      layouts.push({
        x: isLeftSide ? padding : dimensions.width - padding - roomWidth,
        y: padding + rowIndex * roomHeight,
        width: roomWidth,
        height: roomHeight,
        patientId: patient.id,
        patientName: patient.name,
      });
    });

    return layouts;
  }, [wardPatients, dimensions]);

  // Initialize current caregiver position
  useEffect(() => {
    if (caregiverInfo && !caregivers.has(caregiverInfo.name.firstName)) {
      const hallwayX = dimensions.width / 2;
      const hallwayY = dimensions.height / 2;

      setCaregivers((prev) => {
        const updated = new Map(prev);
        updated.set(caregiverInfo.name.firstName, {
          caregiverId: caregiverInfo.name.firstName,
          name: `${caregiverInfo.name.firstName} ${caregiverInfo.name.lastName}`,
          x: hallwayX,
          y: hallwayY,
          isMoving: false,
        });
        return updated;
      });
    }
  }, [caregiverInfo, dimensions, caregivers]);

  // Handle problem assignments - move caregivers to rooms
  useEffect(() => {
    if (!lastProblemUpdate || !wardPatients) return;

    if (lastProblemUpdate.type === "assigned") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const assignedData = lastProblemUpdate.data as any;
      const caregiverName = assignedData.assignedBy?.caregiverName?.firstName;
      const patientId = assignedData.patientId;

      if (!caregiverName) return;

      // Find the room for this patient
      const room = roomLayouts.find((r) => r.patientId === patientId);
      if (!room) return;

      // Calculate center of room
      const targetX = room.x + room.width / 2;
      const targetY = room.y + room.height / 2;

      setCaregivers((prev) => {
        const updated = new Map(prev);
        const caregiver = updated.get(caregiverName);
        if (caregiver) {
          updated.set(caregiverName, {
            ...caregiver,
            x: targetX,
            y: targetY,
            isMoving: true,
            assignedRoom: patientId,
          });

          // Reset isMoving after transition (2s)
          setTimeout(() => {
            setCaregivers((prev) => {
              const updated = new Map(prev);
              const c = updated.get(caregiverName);
              if (c) {
                updated.set(caregiverName, { ...c, isMoving: false });
              }
              return updated;
            });
          }, 2000);
        }
        return updated;
      });
    } else if (
      lastProblemUpdate.type === "resolved" ||
      lastProblemUpdate.type === "updated"
    ) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = lastProblemUpdate.data as any;
      const caregiverName =
        data.resolvedBy?.caregiverName?.firstName ||
        data.updatedBy?.caregiverName?.firstName;

      if (!caregiverName) return;

      // Move caregiver back to hallway
      const hallwayX = dimensions.width / 2;
      const hallwayY = dimensions.height / 2;

      setCaregivers((prev) => {
        const updated = new Map(prev);
        const caregiver = updated.get(caregiverName);
        if (caregiver) {
          updated.set(caregiverName, {
            ...caregiver,
            x: hallwayX,
            y: hallwayY,
            isMoving: true,
            assignedRoom: undefined,
          });

          // Reset isMoving after transition (2s)
          setTimeout(() => {
            setCaregivers((prev) => {
              const updated = new Map(prev);
              const c = updated.get(caregiverName);
              if (c) {
                updated.set(caregiverName, { ...c, isMoving: false });
              }
              return updated;
            });
          }, 2000);
        }
        return updated;
      });
    }
  }, [lastProblemUpdate, roomLayouts, wardPatients, dimensions]);

  return (
    <>
      <div ref={containerRef} className="w-screen h-screen bg-background">
        {/* Main SVG Frame */}
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Define patterns and gradients */}
          <defs>
            <pattern
              id="floorTile"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <rect width="40" height="40" fill="var(--color-base-surface)" />
              <path
                d="M 0 0 L 40 0 L 40 40 L 0 40 Z"
                fill="none"
                stroke="var(--color-base-border)"
                strokeWidth="1"
              />
            </pattern>
            <linearGradient id="wallGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--color-lavender-100)" />
              <stop offset="100%" stopColor="var(--color-lavender-200)" />
            </linearGradient>
          </defs>

          {/* Floor */}
          <rect
            width={dimensions.width}
            height={dimensions.height}
            fill="url(#floorTile)"
          />

          {/* Hallway */}
          <rect
            x={(dimensions.width - 120) / 2}
            y="0"
            width="120"
            height={dimensions.height}
            fill="var(--color-base-surface-muted)"
            opacity="0.5"
          />
          <text
            x={dimensions.width / 2}
            y="30"
            textAnchor="middle"
            fill="var(--color-base-text)"
            fontSize="20"
            fontWeight="bold"
          >
            Ward Hallway
          </text>

          {/* Patient Rooms */}
          {roomLayouts.map((room) => {
            const patient = wardPatients?.patients.find(
              (p) => p.id === room.patientId
            );
            const mostUrgent = patient?.problems.find((p) =>
              isUrgentStatus(p.status)
            );

            return (
              <g key={room.patientId}>
                {/* Room outline */}
                <rect
                  x={room.x}
                  y={room.y}
                  width={room.width}
                  height={room.height}
                  fill="url(#wallGradient)"
                  stroke="var(--color-primary)"
                  strokeWidth="3"
                  rx="8"
                />

                {/* Room number */}
                <rect
                  x={room.x + 10}
                  y={room.y + 10}
                  width="50"
                  height="30"
                  fill="var(--color-background)"
                  stroke="var(--color-primary)"
                  strokeWidth="2"
                  rx="4"
                />
                <text
                  x={room.x + 35}
                  y={room.y + 32}
                  textAnchor="middle"
                  fill="var(--color-primary)"
                  fontSize="18"
                  fontWeight="bold"
                >
                  {room.patientId}
                </text>

                {/* Patient name */}
                <text
                  x={room.x + room.width / 2}
                  y={room.y + 55}
                  textAnchor="middle"
                  fill="var(--color-base-text)"
                  fontSize="16"
                  fontWeight="bold"
                >
                  {room.patientName}
                </text>

                {/* Patient bed icon */}
                <g
                  transform={`translate(${room.x + room.width / 2 - 75}, ${
                    room.y + 80
                  }) scale(0.5)`}
                >
                  <HospitalBed
                    strokeWidth={0}
                    stroke="var(--color-border)"
                    frameColor="var(--color-primary)"
                    accentColor="var(--color-lavender-300)"
                    mattressColor="var(--color-base-surface-muted)"
                    sheetColor="var(--color-apricot-200)"
                    pillowColor="var(--color-background)"
                  />
                </g>

                {/* Problem indicators */}
                {patient?.problems.map((problem, idx) => (
                  <g key={problem.id}>
                    {/* Problem badge */}
                    <circle
                      cx={room.x + room.width / 2 - 40 + idx * 30}
                      cy={room.y + room.height - 40}
                      r="12"
                      fill={getProblemColor(problem.status)}
                      stroke="var(--color-background)"
                      strokeWidth="2"
                    />
                    {problem.status === "critical" && (
                      <text
                        x={room.x + room.width / 2 - 40 + idx * 30}
                        y={room.y + room.height - 36}
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
                        x={room.x + room.width / 2}
                        y={room.y + room.height - 15}
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
                      cx={room.x + room.width - 25}
                      cy={room.y + 25}
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
                      x={room.x + room.width - 25}
                      y={room.y + 30}
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
            );
          })}

          {/* Caregivers */}
          {Array.from(caregivers.values()).map((caregiver) => (
            <g
              key={caregiver.caregiverId}
              transform={`translate(${caregiver.x}, ${caregiver.y})`}
              style={{
                transition: "transform 2s ease-in-out",
              }}
            >
              {/* Caregiver shadow */}
              <ellipse
                cx="0"
                cy="35"
                rx="15"
                ry="5"
                fill="black"
                opacity="0.2"
              />

              {/* Caregiver body */}
              <g>
                {/* Body */}
                <ellipse
                  cx="0"
                  cy="10"
                  rx="12"
                  ry="18"
                  fill="var(--color-azure-500)"
                />

                {/* Head */}
                <circle
                  cx="0"
                  cy="-10"
                  r="10"
                  fill="var(--color-apricot-300)"
                />

                {/* Medical cross on body */}
                <rect
                  x="-2"
                  y="5"
                  width="4"
                  height="12"
                  fill="var(--color-background)"
                />
                <rect
                  x="-5"
                  y="8"
                  width="10"
                  height="4"
                  fill="var(--color-background)"
                />

                {/* Arms */}
                {caregiver.isMoving ? (
                  <>
                    <ellipse
                      cx="-8"
                      cy="10"
                      rx="3"
                      ry="10"
                      fill="var(--color-azure-500)"
                      transform="rotate(-20)"
                    />
                    <ellipse
                      cx="8"
                      cy="10"
                      rx="3"
                      ry="10"
                      fill="var(--color-azure-500)"
                      transform="rotate(20)"
                    />
                  </>
                ) : (
                  <>
                    <ellipse
                      cx="-10"
                      cy="12"
                      rx="3"
                      ry="8"
                      fill="var(--color-azure-500)"
                    />
                    <ellipse
                      cx="10"
                      cy="12"
                      rx="3"
                      ry="8"
                      fill="var(--color-azure-500)"
                    />
                  </>
                )}

                {/* Legs - animate when moving */}
                {caregiver.isMoving ? (
                  <>
                    <rect
                      x="-6"
                      y="25"
                      width="5"
                      height="12"
                      fill="var(--color-azure-700)"
                      rx="2"
                    >
                      <animate
                        attributeName="transform"
                        values="rotate(0 -3.5 25);rotate(-15 -3.5 25);rotate(0 -3.5 25)"
                        dur="0.5s"
                        repeatCount="indefinite"
                      />
                    </rect>
                    <rect
                      x="1"
                      y="25"
                      width="5"
                      height="12"
                      fill="var(--color-azure-700)"
                      rx="2"
                    >
                      <animate
                        attributeName="transform"
                        values="rotate(0 3.5 25);rotate(15 3.5 25);rotate(0 3.5 25)"
                        dur="0.5s"
                        repeatCount="indefinite"
                      />
                    </rect>
                  </>
                ) : (
                  <>
                    <rect
                      x="-6"
                      y="25"
                      width="5"
                      height="12"
                      fill="var(--color-azure-700)"
                      rx="2"
                    />
                    <rect
                      x="1"
                      y="25"
                      width="5"
                      height="12"
                      fill="var(--color-azure-700)"
                      rx="2"
                    />
                  </>
                )}
              </g>

              {/* Caregiver name label */}
              <rect
                x="-40"
                y="-35"
                width="80"
                height="20"
                fill="var(--color-background)"
                stroke="var(--color-azure-500)"
                strokeWidth="2"
                rx="10"
              />
              <text
                x="0"
                y="-20"
                textAnchor="middle"
                fill="var(--color-azure-700)"
                fontSize="12"
                fontWeight="bold"
              >
                {caregiver.name}
              </text>
            </g>
          ))}

          {/* Legend */}
          <g
            transform={`translate(${dimensions.width - 200}, ${
              dimensions.height - 150
            })`}
          >
            <rect
              x="0"
              y="0"
              width="180"
              height="130"
              fill="var(--color-background)"
              stroke="var(--color-border)"
              strokeWidth="2"
              rx="8"
            />
            <text
              x="10"
              y="20"
              fill="var(--color-base-text)"
              fontSize="14"
              fontWeight="bold"
            >
              Status Legend:
            </text>

            <circle cx="20" cy="40" r="8" fill={getProblemColor("critical")} />
            <text x="35" y="45" fill="var(--color-base-text)" fontSize="12">
              Critical
            </text>

            <circle cx="20" cy="60" r="8" fill={getProblemColor("serious")} />
            <text x="35" y="65" fill="var(--color-base-text)" fontSize="12">
              Serious
            </text>

            <circle
              cx="20"
              cy="80"
              r="8"
              fill={getProblemColor("processing")}
            />
            <text x="35" y="85" fill="var(--color-base-text)" fontSize="12">
              Processing
            </text>

            <circle cx="20" cy="100" r="8" fill={getProblemColor("resolved")} />
            <text x="35" y="105" fill="var(--color-base-text)" fontSize="12">
              Resolved
            </text>

            <circle cx="20" cy="120" r="8" fill={getProblemColor("stable")} />
            <text x="35" y="125" fill="var(--color-base-text)" fontSize="12">
              Stable
            </text>
          </g>
        </svg>
      </div>
    </>
  );
};

export default Ward;
