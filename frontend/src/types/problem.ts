export type ProblemStatus = "critical" | "serious" | "stable" | "resolved";

export interface Problem {
  id: string;
  description: string;
  status: ProblemStatus;
  createdAt: Date;
  updatedAt: Date;
}
