/**
 * Ward Patient/Problem Management Service
 *
 * Manages patient and problem data for caregivers in the ward namespace.
 * Handles assignment tracking, status updates, and broadcast notifications.
 */

import {
  getPatients,
  getPatient,
  updateProblemStatus,
} from "@models/patients.model";
import { WardEventData } from "../types/socket.events";

//  TODO: replace temporary problem by Problem Class

/** Track which caregiver is assigned to which problem */
interface ProblemAssignment {
  caregiverId: string;
  caregiverName: {
    firstName: string;
    lastName: string;
  };
  assignedAt: Date;
}

const problemAssignments = new Map<string, ProblemAssignment>(); // Key: `${patientId}:${problemId}`

/**
 * Get all patients for the ward with serialized data
 */
export function getWardPatients(): WardEventData.WardPatients {
  const patients = getPatients();

  const serializedPatients = patients.map((patient) => ({
    id: patient.id,
    name: patient.name,
    problems: patient.problems.map((problem) => {
      const assignmentKey = `${patient.id}:${problem.id}`;
      const assignment = problemAssignments.get(assignmentKey);

      return {
        id: problem.id,
        description: problem.description,
        status: problem.status as
          | "critical"
          | "serious"
          | "stable"
          | "resolved",
        ...(assignment && {
          assignedTo: {
            caregiverId: assignment.caregiverId,
            caregiverName: assignment.caregiverName,
          },
        }),
        createdAt: problem.createdAt.toISOString(),
        updatedAt: problem.updatedAt.toISOString(),
      };
    }),
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

  // Check if problem is already assigned
  const assignmentKey = `${patientId}:${problemId}`;
  if (problemAssignments.has(assignmentKey)) {
    return null; // Already assigned
  }

  // Record the assignment
  problemAssignments.set(assignmentKey, {
    caregiverId,
    caregiverName,
    assignedAt: new Date(),
  });

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

  // Update problem status to resolved
  updateProblemStatus(patientId, problemId, "resolved");

  // Remove assignment
  const assignmentKey = `${patientId}:${problemId}`;
  problemAssignments.delete(assignmentKey);

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

  // Update the problem
  updateProblemStatus(patientId, problemId, newStatus);

  // If resolved, unassign it
  if (newStatus === "resolved") {
    const assignmentKey = `${patientId}:${problemId}`;
    problemAssignments.delete(assignmentKey);
  }

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

  for (const [key, assignment] of problemAssignments.entries()) {
    if (assignment.caregiverId === caregiverId) {
      const parts = key.split(":");
      const patientId = parts[0];
      const problemId = parts[1];
      if (patientId && problemId) {
        problems.push({ patientId, problemId });
      }
    }
  }

  return problems;
}

/**
 * Release all problems assigned to a caregiver (when they disconnect)
 */
export function releaseCaregiversProblems(caregiverId: string): void {
  const keysToDelete: string[] = [];

  for (const [key, assignment] of problemAssignments.entries()) {
    if (assignment.caregiverId === caregiverId) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach((key) => problemAssignments.delete(key));

  if (keysToDelete.length > 0) {
    console.log(
      `[Problem] Released ${keysToDelete.length} problem(s) from caregiver ${caregiverId}`,
    );
  }
}
