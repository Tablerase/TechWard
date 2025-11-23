/**
 * Problem Status Utilities
 *
 * Centralized logic for problem status handling across components.
 * Uses theme colors defined in index.css for consistency.
 */

export type ProblemStatus =
  | "critical"
  | "serious"
  | "stable"
  | "resolved"
  | "processing";

/**
 * Get the theme color for a problem status
 * Returns CSS custom property reference for theme consistency
 */
export function getProblemColor(status: ProblemStatus | string): string {
  switch (status) {
    case "critical":
      return "var(--color-status-critical)";
    case "serious":
      return "var(--color-status-serious)";
    case "processing":
      return "var(--color-status-processing)";
    case "resolved":
      return "var(--color-status-resolved)";
    case "stable":
      return "var(--color-status-stable)";
    default:
      return "var(--color-muted)";
  }
}

/**
 * Get status badge variant for UI components
 */
export function getStatusBadgeVariant(
  status: ProblemStatus | string
): "default" | "destructive" | "outline" {
  switch (status) {
    case "critical":
      return "destructive";
    case "serious":
    case "processing":
      return "outline";
    case "resolved":
    case "stable":
    default:
      return "default";
  }
}

/**
 * Get human-readable status label
 */
export function getStatusLabel(status: ProblemStatus | string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

/**
 * Check if a status is urgent (requires immediate attention)
 */
export function isUrgentStatus(status: ProblemStatus | string): boolean {
  return status === "critical" || status === "serious";
}

/**
 * Get status priority for sorting (higher = more urgent)
 */
export function getStatusPriority(status: ProblemStatus | string): number {
  switch (status) {
    case "critical":
      return 4;
    case "serious":
      return 3;
    case "processing":
      return 2;
    case "stable":
      return 1;
    case "resolved":
      return 0;
    default:
      return -1;
  }
}
