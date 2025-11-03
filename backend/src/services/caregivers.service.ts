import * as caregiversModel from "@models/caregivers.model"

export function getCaregivers() {
  return caregiversModel.getCaregivers();
}

export function addCaregiver() {
  return caregiversModel.addCaregiver();
}

