// src/PatientRoom.tsx
import { useState } from "react";
import "./PatientRoom.css";

type PatientStatus = "critical" | "healthy";

export const PatientRoom = () => {
  const [status, setStatus] = useState<PatientStatus>("critical");

  const toggleStatus = () => {
    setStatus(status === "critical" ? "healthy" : "critical");
  };

  return (
    <svg width="500" height="500">
      <rect
        className={`room ${status}`}
        x="50"
        y="50"
        width="250"
        height="250"
        rx="10"
        ry="10"
      />
      <foreignObject x="150" y="150" width="100" height="100">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <button onClick={toggleStatus}>Toggle</button>
        </div>
      </foreignObject>
    </svg>
  );
};
