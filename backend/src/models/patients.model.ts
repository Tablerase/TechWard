import { ArgoProblem } from "@entity/argoProblem";
import { Patient } from "@entity/patient";
import { Problem } from "@entity/problem";

const patients: Patient[] = [
  {
    id: "1",
    name: "Claude Argo",
    problems: [new ArgoProblem("Bandage soiled")],
  },
  {
    id: "2",
    name: "Simple Guy",
    problems: [new Problem("p2", "Simple problem", "default", "critical")],
  },
];

export function getPatients() {
  return patients;
}

export function getPatient(patientId: string) {
  return patients.find((p) => p.id === patientId) || null;
}

export function addProblem(patientId: string, problem: Problem) {
  const patient = getPatient(patientId);
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

  // Use Problem class method to update status
  problem.updateStatus(newStatus);
  return problem;
}
