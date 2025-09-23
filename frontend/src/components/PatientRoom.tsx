import { Patient } from "@/types";
import { useProblemToggle } from "@hooks/useProblemToggle";
import { getPatientById } from "@services/patientService";
import { useEffect, useMemo, useState } from "react";
import "./PatientRoom.css";

export const PatientRoom = () => {
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getPatientById("1");
        setPatient(data);
      } catch (err) {
        console.error("Error while fetching patient", err);
      }
    })();
  }, []);

  const firstProblem = patient?.problems?.[0] ?? null;

  const { status, loading, toggleStatus } = useProblemToggle({
    patientId: patient?.id ?? "1",
    problemId: firstProblem?.id ?? "p1",
    initialStatus: firstProblem?.status ?? "critical",
  });

  const roomClass = useMemo(
    () => (status === "resolved" ? "healthy" : status),
    [status]
  );

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
        // stroke="yellow"
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
          {loading ? "" : patient?.name}
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
          <button onClick={toggleStatus} disabled={loading}>
            {loading
              ? "Updating..."
              : status === "resolved"
                ? "Mark Critical"
                : "Resolve Problem"}
          </button>
        </div>
      </foreignObject>
    </svg>
  );
};
