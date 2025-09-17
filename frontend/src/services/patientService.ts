import { Problem, ProblemStatus } from "@/types";
import { fetchWithTimeout } from "@utils/fetchWithTimeout";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export async function getPatients() {
  const response = await fetchWithTimeout(`${API_BASE_URL}/patients`);
  if (!response.ok) {
    throw new Error("Failed to fetch patients");
  }
  return response.json();
}

export async function getPatientById(patientId: string) {
  const response = await fetchWithTimeout(
    `${API_BASE_URL}/patients/${patientId}`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch patient with id ${patientId}`);
  }
  return response.json();
}

export async function updateProblemStatus(
  patientId: string,
  problemId: string,
  status: ProblemStatus
): Promise<Problem> {
  const response = await fetchWithTimeout(
    `${API_BASE_URL}/patients/${patientId}/problems/${problemId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    }
  );
  if (!response.ok) {
    throw new Error(
      `Failed to update problem status for problem with id ${problemId}`
    );
  }
  return response.json();
}
