import { Caregiver } from "./caregiver";

export type ProblemStatus =
  | "critical"
  | "serious"
  | "stable"
  | "resolved"
  | "processing";

export const ProblemTypes = {
  DEFAULT: "default",
  ARGO: "argo",
} as const;

export type ProblemType = (typeof ProblemTypes)[keyof typeof ProblemTypes];

export class Problem {
  id: string;
  description: string;
  type: ProblemType;
  status: ProblemStatus;
  createdAt: Date;
  updatedAt: Date;
  assignedCaregiver: Caregiver | undefined;
  assignedAt: Date | undefined;

  /**
   * Creates a new Problem instance.
   * @param id - The unique identifier for the problem.
   * @param description - A brief description of the problem.
   * @param type - The type of the problem (default is "default").
   * @param status - The current status of the problem (default is "critical").
   */
  constructor(
    id: string,
    description: string,
    type: ProblemType = ProblemTypes.DEFAULT,
    status: ProblemStatus = "critical",
  ) {
    this.id = id;
    this.description = description;
    this.type = type;
    this.status = status;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Check if the problem is available for assignment
   *
   * Available means: not assigned and not resolved
   */
  isAvailable(): boolean {
    return !this.assignedCaregiver && this.status !== "resolved";
  }

  /**
   * Check if the problem is locked (can be overridden by subclasses)
   * Default implementation: problems are never locked
   */
  isLocked(): boolean {
    return false;
  }

  /**
   * Get the lock expiration time (can be overridden by subclasses)
   * Default implementation: no lock
   */
  getLockedUntil(): Date | null {
    return null;
  }

  /**
   * Assign the problem to a caregiver
   */
  assignTo(caregiver: Caregiver): void {
    if (!this.isAvailable()) {
      throw new Error("Problem is not available for assignment");
    }
    this.assignedCaregiver = caregiver;
    this.assignedAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Release the problem from current caregiver
   * After release, it can be reassigned to another caregiver
   */
  release(): void {
    this.assignedCaregiver = undefined;
    this.assignedAt = undefined;
    this.updatedAt = new Date();
  }

  /**
   * Resolve the problem and release from caregiver
   */
  async resolve(): Promise<void> {
    this.status = "resolved";
    this.release();
  }

  /**
   * Update problem status
   *
   * After resolve, problem is no longer assigned to any caregiver
   */
  updateStatus(newStatus: ProblemStatus): void {
    this.status = newStatus;
    this.updatedAt = new Date();
    if (newStatus === "resolved") {
      this.release();
    }
  }

  /**
   * Reset the problem to initial state
   *
   * Makes it available for assignment again
   */
  reset(newStatus: ProblemStatus = "critical"): void {
    this.status = newStatus;
    this.release();
  }
}
