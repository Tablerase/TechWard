import * as caregiversModel from "@models/caregivers.model";

export function getCaregivers() {
  return caregiversModel.getCaregivers();
}

export function getCaregiver(id: string) {
  return caregiversModel.getCaregiver(id);
}

export function addCaregiver(
  id: string,
  firstName?: string,
  lastName?: string,
) {
  return caregiversModel.addCaregiver(id, firstName, lastName);
}

export function removeCaregiver(id: string) {
  return caregiversModel.removeCaregiver(id);
}

export function addResolvedProblem(
  caregiverId: string,
  problemId: string,
  patientId: string,
  description: string,
) {
  return caregiversModel.addResolvedProblem(
    caregiverId,
    problemId,
    patientId,
    description,
  );
}

export function getCaregiverStats(caregiverId: string) {
  return caregiversModel.getCaregiverStats(caregiverId);
}
