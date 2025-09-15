// src/PatientRoom.tsx
import { useEffect, useState } from "react";
import "./PatientRoom.css";

type PatientStatus = "critical" | "healthy";

export const PatientRoom = () => {
  const [status, setStatus] = useState<PatientStatus>("critical");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const resp = await fetch("http://localhost:3000/problems");
        const data = await resp.json();
        console.log(data);
      } catch (err) {
        console.error('Error while fetching PatientStatus', err);
      }
    };

    fetchStatus();
  }, []);

  const toggleStatus = () => {
    setStatus(status === "critical" ? "healthy" : "critical");
  };

  return (
    <svg width="500" height="500">
      <rect
        className={`room ${status}`}
        x="5"
        y="5"
        width="490"
        height="490"
        rx="10"
        ry="10"
      />
      <path
        id="textCurve"
        d="
          M 50, 150 
          C 200, 100 300, 50
          450, 100
          "
        fill="transparent"
        // stroke="red"
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
          Claude ARGO
        </textPath>
      </text>
      <foreignObject x="200" y="200" width="100" height="100">
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
