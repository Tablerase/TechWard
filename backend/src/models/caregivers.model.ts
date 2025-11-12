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
    resolvedProblems: [],
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

/**
 * Add a resolved problem to a caregiver's history
 */
export function addResolvedProblem(
  caregiverId: string,
  problemId: string,
  patientId: string,
  description: string,
): void {
  const caregiver = getCaregiver(caregiverId);
  if (!caregiver) {
    console.error(`Caregiver ${caregiverId} not found`);
    return;
  }

  caregiver.resolvedProblems.push({
    problemId,
    patientId,
    description,
    resolvedAt: new Date(),
  });

  console.log(
    `[Caregiver] Added resolved problem ${problemId} to caregiver ${caregiverId}'s history`,
  );
}

/**
 * Get statistics for a caregiver
 */
export function getCaregiverStats(caregiverId: string) {
  const caregiver = getCaregiver(caregiverId);
  if (!caregiver) {
    return null;
  }

  return {
    id: caregiver.id,
    name: {
      firstName: caregiver.firstname,
      lastName: caregiver.lastname,
    },
    totalResolved: caregiver.resolvedProblems.length,
    resolvedProblems: caregiver.resolvedProblems.map((rp) => ({
      problemId: rp.problemId,
      patientId: rp.patientId,
      description: rp.description,
      resolvedAt: rp.resolvedAt.toISOString(),
    })),
  };
}
