import { useEffect, useMemo, useState } from "react";
import "./PatientRoom.css";
import { useSocket } from "@/hooks/useSocket";
import { WardEvents } from "@/types/socket.events";

export const PatientRoom = () => {
  const { wardSocket, wardPatients } = useSocket();

  // Get the first patient and first problem for visualization
  const patient = wardPatients?.patients[0] ?? null;
  const problem = patient?.problems[0] ?? null;
  const [loading, setLoading] = useState(false);

  const status = problem?.status ?? "critical";

  // Update problem status with next status
  const toggleStatus = async () => {
    if (!problem || !wardSocket || !patient) return;

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

  // Clear loading state when patients update
  useEffect(() => {
    setLoading(false);
  }, [wardPatients]);

  const roomClass = useMemo(
    () => (status === "resolved" ? "healthy" : status),
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
        style={{ cursor: "pointer", opacity: loading ? 0.6 : 1 }}
        onClick={toggleStatus}
      />
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
          <button onClick={toggleStatus} disabled={loading || !wardSocket}>
            {loading
              ? "Updating..."
              : status === "resolved"
              ? "Mark Critical"
              : `Next Status (${status})`}
          </button>
        </div>
      </foreignObject>
    </svg>
  );
};
