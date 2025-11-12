import { useEffect, useMemo, useState } from "react";
import "./PatientRoom.css";
import { WardEvents } from "@/types/socket.events";
import { useWardSocket } from "@/context/WardSocketContext";

export const PatientRoom = () => {
  const { wardSocket, wardPatients } = useWardSocket();

  // Get the first patient and first problem for visualization
  const patient = wardPatients?.patients[0] ?? null;
  const problem = patient?.problems[0] ?? null;
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  const status = problem?.status ?? "critical";

  // Helper function to check if a problem is actually locked (not expired)
  const isActuallyLocked = (prob: typeof problem): boolean => {
    if (!prob?.isLocked || !prob?.lockedUntil) return false;

    const lockEnd = new Date(prob.lockedUntil);
    return currentTime < lockEnd.getTime();
  };

  const isLocked = isActuallyLocked(problem);

  // Update current time every second for countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Update problem status with next status
  const toggleStatus = async () => {
    if (!problem || !wardSocket || !patient || isLocked) return;

    setLoading(true);

    const statusSequence: Array<
      "critical" | "serious" | "stable" | "resolved"
    > = ["critical", "serious", "stable", "resolved"];

    const statusToCheck = status as
      | "critical"
      | "serious"
      | "stable"
      | "resolved";
    const currentIndex = statusSequence.indexOf(statusToCheck);
    const nextStatus =
      statusSequence[(currentIndex + 1) % statusSequence.length];

    wardSocket.emit(WardEvents.UPDATE_PROBLEM, {
      patientId: patient.id,
      problemId: problem.id,
      status: nextStatus,
    });

    // Loading will be cleared when we receive the updated patients list
  };

  // Calculate time remaining for locked problems
  const getTimeRemaining = (lockedUntil: string) => {
    const lockEnd = new Date(lockedUntil);
    const diff = lockEnd.getTime() - currentTime;

    if (diff <= 0) return null;

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Clear loading state when patients update
  useEffect(() => {
    setLoading(false);
  }, [wardPatients]);

  const roomClass = useMemo(
    () =>
      status === "resolved"
        ? "healthy"
        : status === "processing"
        ? "serious"
        : status,
    [status]
  );

  if (!patient || !problem) {
    return (
      <svg width="500" height="500">
        <rect
          className="room critical"
          x="5"
          y="5"
          width="490"
          height="490"
          rx="10"
          ry="10"
        />
        <text x="250" y="250" textAnchor="middle" fontSize="24" fill="white">
          Loading patients...
        </text>
      </svg>
    );
  }

  return (
    <svg width="500" height="500">
      <rect
        className={`room ${roomClass}`}
        x="5"
        y="5"
        width="490"
        height="490"
        rx="10"
        ry="10"
        style={{
          cursor: isLocked ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
        }}
        onClick={toggleStatus}
      />

      {/* Lock Icon Overlay */}
      {isLocked && (
        <g>
          <circle cx="250" cy="100" r="40" fill="rgba(220, 38, 38, 0.9)" />
          <path
            d="M 235 90 L 235 85 A 15 15 0 0 1 265 85 L 265 90 M 230 90 L 270 90 L 270 115 L 230 115 Z"
            fill="white"
            stroke="white"
            strokeWidth="2"
          />
          <circle cx="250" cy="105" r="3" fill="rgba(220, 38, 38, 0.9)" />
          <rect
            x="248"
            y="105"
            width="4"
            height="6"
            fill="rgba(220, 38, 38, 0.9)"
          />
        </g>
      )}

      {/* Lock Timer Text */}
      {isLocked && problem?.lockedUntil && (
        <text
          x="250"
          y="150"
          textAnchor="middle"
          fontSize="16"
          fill="#dc2626"
          fontWeight="bold"
        >
          Locked: {getTimeRemaining(problem.lockedUntil) || "Expiring..."}
        </text>
      )}

      <path
        id="textCurve"
        d="M 50, 150 C 200, 100 300, 50 450, 100"
        fill="transparent"
        strokeWidth={2}
      />
      <text
        fontSize={45}
        fontWeight={900}
        letterSpacing={-6}
        fill="transparent"
        stroke="#333333cc"
        strokeWidth={2}
        paintOrder="stroke fill markers"
        dominantBaseline="middle"
        className="roomText"
      >
        <textPath href="#textCurve" startOffset="20%">
          <animate
            attributeName="startOffset"
            values="-50%;100%;"
            dur="10s"
            repeatCount="indefinite"
          />
          {loading ? "" : patient.name}
        </textPath>
      </text>
      <foreignObject x="190" y="200" width="150" height="120">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <button
            onClick={toggleStatus}
            disabled={
              loading || !wardSocket || isLocked || status === "processing"
            }
            style={{
              opacity: isLocked || status === "processing" ? 0.5 : 1,
              cursor:
                isLocked || status === "processing" ? "not-allowed" : "pointer",
            }}
          >
            {loading
              ? "Updating..."
              : isLocked
              ? "🔒 Locked"
              : status === "processing"
              ? "⏳ Processing..."
              : status === "resolved"
              ? "Mark Critical"
              : `Next Status (${status})`}
          </button>
        </div>
      </foreignObject>
    </svg>
  );
};
