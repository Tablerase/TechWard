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
