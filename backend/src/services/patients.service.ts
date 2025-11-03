import { Patient } from "@entity/patient";
import { Problem } from "@entity/problem";
import { computePatientStatus } from "@utils/health";
import { updateDeployment } from "@services/index";
import * as patientsModel from "@models/patients.model";

// TODO: : Add reset problem logic so when new user recover patients/patient the resolved problem can be reassigned


export function getPatients() {
  return patientsModel.getPatients();
}

export function getPatient(patientId: string) {
  return patientsModel.getPatient(patientId);
}

export function getPatientHealth(patient: Patient): string {
  const statuses = patient.problems.map((p) => p.status);
  return computePatientStatus(statuses);
}

export function addProblem(patientId: string, problem: Problem) {
  return patientsModel.addProblem(patientId, problem);
}

export function updateProblemStatus(
  patientId: string,
  problemId: string,
  newStatus: Problem["status"],
) {
  return patientsModel.updateProblemStatus(patientId, problemId, newStatus);
}

export async function resolveProblem(patientId: string, problemId: string) {
  const patient = getPatient(patientId);
  const problem = patient?.problems.find((p: Problem) => p.id === problemId);

  if (!problem) { return null }

  if (problem?.type === "argo") {
    await updateDeployment();
  }

  problem?.resolve();
  console.log(problem)

  return problem;
}
