import { Patient } from "@entity/patient";
import { Problem } from "@entity/problem";
import { computePatientStatus } from "@utils/health";
import { updateDeployment } from "@utils/argocdDemo/updateDeployment";

const patients: Patient[] = [
  {
    id: "1",
    name: "Claude Argo",
    problems: [
      {
        id: "p1",
        description: "Bandage soiled",
        status: "serious",
        type: 'argo',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  },
];

export function getPatients() {
  return patients;
}

export function getPatient(patientId: string) {
  return patients.find((p) => p.id === patientId) || null;
}

export function getPatientHealth(patient: Patient): string {
  const statuses = patient.problems.map((p) => p.status);
  return computePatientStatus(statuses);
}

export function addProblem(patientId: string, problem: Problem) {
  const patient = patients.find((p) => p.id === patientId);
  if (!patient) return null;
  patient.problems.push(problem);
  return problem;
}

export function updateProblemStatus(
  patientId: string,
  problemId: string,
  newStatus: Problem["status"],
) {
  const patient = getPatient(patientId);
  if (!patient) return null;
  const problem = patient.problems.find((pr) => pr.id === problemId);
  if (!problem) return null;
  problem.status = newStatus;
  problem.updatedAt = new Date();
  return problem;
}

export async function resolveProblem(patientId: string, problemId: string) {
  // TODO: avoid repetition for patient and problem find in both resolve and upddate status
  const patient = getPatient(patientId);
  const problem = patient?.problems.find((p) => p.id === problemId);

  if (problem?.type === "argo") {
    await updateDeployment();
  }

  return updateProblemStatus(patientId, problemId, "resolved");
}
