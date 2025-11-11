import { Caregiver } from "@entity/caregiver";
import { funnyCaregiverNameGenerator } from "@utils/funnyCaregiverNames";

const caregivers: Caregiver[] = [];

export function getCaregivers() {
  return caregivers;
}

export function getCaregiver(id: string): Caregiver | undefined {
  return caregivers.find((c) => c.id === id);
}

export function addCaregiver(
  id: string,
  firstName?: string,
  lastName?: string,
) {
  // Check if caregiver already exists
  const existing = getCaregiver(id);
  if (existing) {
    return existing;
  }

  // Generate name if not provided
  const name =
    firstName && lastName
      ? { firstName, lastName }
      : funnyCaregiverNameGenerator();

  const newCaregiver: Caregiver = {
    id,
    firstname: name.firstName,
    lastname: name.lastName,
  };

  caregivers.push(newCaregiver);
  return newCaregiver;
}

export function removeCaregiver(id: string): boolean {
  const index = caregivers.findIndex((c) => c.id === id);
  if (index !== -1) {
    caregivers.splice(index, 1);
    return true;
  }
  return false;
}
