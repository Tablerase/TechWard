import { Caregiver } from "@entity/caregiver";
import { funnyCaregiverNameGenerator } from "@utils/funnyCaregiverNames";

const caregivers: Caregiver[] = [];

export function getCaregivers() {
  return caregivers;
}

export function addCaregiver() {
  const newCaregiverName = funnyCaregiverNameGenerator()
  const newCaregiver: Caregiver = {
    firstname: newCaregiverName.firstName,
    lastname: newCaregiverName.lastName,
  }
  caregivers.push(newCaregiver)
  return newCaregiverName;
}
