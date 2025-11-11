/**
 * Ward Patient/Problem Management Service
 *
 * Manages patient and problem data for caregivers in the ward namespace.
 * Handles assignment tracking, status updates, and broadcast notifications.
 */

import { getPatients, getPatient } from "@models/patients.model";
import { WardEventData } from "../types/socket.events";
import * as caregiversService from "@services/caregivers.service";

/**
 * Get all patients for the ward with serialized data
 */
export function getWardPatients(): WardEventData.WardPatients {
  const patients = getPatients();

  const serializedPatients = patients.map((patient) => ({
    id: patient.id,
    name: patient.name,
    problems: patient.problems.map((problem) => ({
      id: problem.id,
      description: problem.description,
      status: problem.status as "critical" | "serious" | "stable" | "resolved",
      ...(problem.assignedCaregiver && {
        assignedTo: {
          caregiverId: problem.assignedCaregiver.id,
          caregiverName: {
            firstName: problem.assignedCaregiver.firstname,
            lastName: problem.assignedCaregiver.lastname,
          },
        },
      }),
      createdAt: problem.createdAt.toISOString(),
      updatedAt: problem.updatedAt.toISOString(),
    })),
  }));

  return { patients: serializedPatients };
}

/**
 * Assign a problem to a caregiver
 */
export function assignProblem(
  patientId: string,
  problemId: string,
  caregiverId: string,
  caregiverName: {
    firstName: string;
    lastName: string;
  },
): WardEventData.ProblemAssigned | null {
  const patient = getPatient(patientId);
  if (!patient) return null;

  const problem = patient.problems.find((p) => p.id === problemId);
  if (!problem) return null;

  // Check if problem is available for assignment
  if (!problem.isAvailable()) {
    return null; // Already assigned or resolved
  }

  // Get or create caregiver
  const caregiver = caregiversService.getCaregiver(caregiverId);
  if (!caregiver) {
    console.error(`[Problem] Caregiver ${caregiverId} not found`);
    return null;
  }

  try {
    problem.assignTo(caregiver);
  } catch (error) {
    console.error(`[Problem] Failed to assign problem ${problemId}:`, error);
    return null;
  }

  console.log(
    `[Problem] Problem ${problemId} assigned to ${caregiverName.firstName} ${caregiverName.lastName}`,
  );

  return {
    patientId,
    problemId,
    assignedBy: {
      caregiverId,
      caregiverName,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Resolve a problem (mark as resolved and unassign)
 */
export function resolveProblem(
  patientId: string,
  problemId: string,
  caregiverId: string,
  caregiverName: {
    firstName: string;
    lastName: string;
  },
): WardEventData.ProblemResolved | null {
  const patient = getPatient(patientId);
  if (!patient) return null;

  const problem = patient.problems.find((p) => p.id === problemId);
  if (!problem) return null;

  // Resolve the problem using Problem class method
  problem.resolve();

  console.log(
    `[Problem] Problem ${problemId} resolved by ${caregiverName.firstName} ${caregiverName.lastName}`,
  );

  return {
    patientId,
    problemId,
    resolvedBy: {
      caregiverId,
      caregiverName,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Update problem status
 */
export function updateProblemStatusInWard(
  patientId: string,
  problemId: string,
  newStatus: "critical" | "serious" | "stable" | "resolved",
  caregiverId: string,
  caregiverName: {
    firstName: string;
    lastName: string;
  },
): WardEventData.ProblemUpdated | null {
  const patient = getPatient(patientId);
  if (!patient) return null;

  const problem = patient.problems.find((p) => p.id === problemId);
  if (!problem) return null;

  // Update the problem using Problem class method
  problem.updateStatus(newStatus);

  console.log(
    `[Problem] Problem ${problemId} status updated to ${newStatus} by ${caregiverName.firstName} ${caregiverName.lastName}`,
  );

  return {
    patientId,
    problemId,
    newStatus,
    updatedBy: {
      caregiverId,
      caregiverName,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Check if a caregiver has any assigned problems
 */
export function getCaregiversProblems(caregiverId: string): Array<{
  patientId: string;
  problemId: string;
}> {
  const problems: Array<{ patientId: string; problemId: string }> = [];
  const patients = getPatients();

  for (const patient of patients) {
    for (const problem of patient.problems) {
      // Check if this problem is assigned to the specified caregiver
      if (
        problem.assignedCaregiver &&
        problem.assignedCaregiver.id === caregiverId
      ) {
        problems.push({
          patientId: patient.id,
          problemId: problem.id,
        });
      }
    }
  }

  return problems;
}

/**
 * Release all problems assigned to a caregiver (when they disconnect)
 */
export function releaseCaregiversProblems(caregiverId: string): void {
  const patients = getPatients();
  let releasedCount = 0;

  for (const patient of patients) {
    for (const problem of patient.problems) {
      // Check if this problem is assigned to the specified caregiver
      if (
        problem.assignedCaregiver &&
        problem.assignedCaregiver.id === caregiverId
      ) {
        problem.release();
        releasedCount++;
      }
    }
  }

  if (releasedCount > 0) {
    console.log(
      `[Problem] Released ${releasedCount} problem(s) from caregiver ${caregiverId}`,
    );
  }
}
