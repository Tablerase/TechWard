export const statusPriority: Record<string, number> = {
  critical: 4,
  serious: 3,
  stable: 2,
  resolved: 1,
};

export function computePatientStatus(problemStatuses: string[]): string {
  if (!problemStatuses.length) return "resolved"; // no problems = healthy
  let maxPriority = 0;
  let worstStatus = "resolved";

  for (const status of problemStatuses) {
    const priority = statusPriority[status] || 0;
    if (priority > maxPriority) {
      maxPriority = priority;
      worstStatus = status;
    }
  }

  return worstStatus;
}
