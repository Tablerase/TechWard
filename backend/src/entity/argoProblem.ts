import { getDeploymentImage } from "@services/kubernetes.service";
import { Problem, ProblemStatus } from "./problem";
import { allowedTags, updateDeployment } from "@services/argoDemo.service";

if (!process.env.ARGOCD_DEMO_APPLICATION_NAME) {
  throw new Error("Missing argo demo application name in env");
}
if (!process.env.ARGOCD_DEMO_NAMESPACE) {
  throw new Error("Missing argo demo namespace in env");
}

export class ArgoProblem extends Problem {
  private cooldown: number = 180000; // 3 min : max argo sync time , delay avoid to many resources usage
  private lockedUntil: Date | null = null; // Track when the lock expires

  /**
   * Creates a new Argo Problem instance.
   * @param description - A brief description of the problem.
   */
  constructor(description: string) {
    super("argoPb", description, "argo", "serious");
  }

  /**
   * Check if the problem is currently locked
   */
  isLocked(): boolean {
    if (!this.lockedUntil) return false;
    return new Date() < this.lockedUntil;
  }

  /**
   * Get the lock expiration time
   */
  getLockedUntil(): Date | null {
    return this.lockedUntil;
  }

  /**
   * Lock the problem for the cooldown duration
   */
  private lock(): void {
    this.lockedUntil = new Date(Date.now() + this.cooldown);
    console.log(
      `[ArgoProblem] Problem ${this.id} locked until ${this.lockedUntil.toISOString()}`,
    );
  }

  /**
   * Unlock the problem
   */
  private unlock(): void {
    this.lockedUntil = null;
    console.log(`[ArgoProblem] Problem ${this.id} unlocked`);
  }

  waitBeforeReset() {
    setTimeout(() => {
      this.reset("serious");
      this.unlock(); // Unlock when reset
    }, this.cooldown);
  }

  async resolve(): Promise<void> {
    if (this.status == "resolved") {
      return;
    }

    // Check if locked
    if (this.isLocked()) {
      const timeRemaining = this.lockedUntil
        ? Math.ceil((this.lockedUntil.getTime() - Date.now()) / 1000)
        : 0;
      throw new Error(
        `Problem is locked. Please wait ${timeRemaining} seconds before trying again.`,
      );
    }

    // Lock the problem for the cooldown duration
    this.lock();

    // Set status to processing while the async work happens
    this.status = "processing";
    this.updatedAt = new Date();

    try {
      const image = await getDeploymentImage(
        process.env.ARGOCD_DEMO_NAMESPACE,
        process.env.ARGOCD_DEMO_APPLICATION_NAME,
      );
      const newTag = allowedTags.find((value) => !image?.includes(value));
      await updateDeployment(newTag);

      // Mark as resolved after successful deployment
      this.status = "resolved";
      this.release();
      this.waitBeforeReset();
    } catch (error) {
      // If deployment fails, revert to serious status but keep the lock
      console.error("[ArgoProblem] Failed to resolve:", error);
      this.status = "serious";
      this.updatedAt = new Date();
      // Keep lock active even on failure to prevent spam
      this.waitBeforeReset();
      throw error;
    }
  }

  /**
   * Override updateStatus to respect the lock
   */
  updateStatus(newStatus: ProblemStatus): void {
    if (this.isLocked()) {
      const timeRemaining = this.lockedUntil
        ? Math.ceil((this.lockedUntil.getTime() - Date.now()) / 1000)
        : 0;
      throw new Error(
        `Problem is locked. Please wait ${timeRemaining} seconds before changing status.`,
      );
    }
    super.updateStatus(newStatus);
  }

  /**
   * Override reset to clear the lock
   */
  reset(newStatus: ProblemStatus = "critical"): void {
    super.reset(newStatus);
    this.unlock();
  }
}
