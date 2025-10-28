export type ProblemStatus = "critical" | "serious" | "stable" | "resolved";

const ProblemTypes = {
  DEFAULT: "default",
  ARGO: "argo",
} as const;

export type ProblemType = (typeof ProblemTypes)[keyof typeof ProblemTypes];

export interface Problem {
  id: string;
  description: string;
  type: ProblemType;
  status: ProblemStatus;
  createdAt: Date;
  updatedAt: Date;
}
