export interface ResolvedProblem {
  problemId: string;
  patientId: string;
  description: string;
  resolvedAt: Date;
}

export interface Caregiver {
  id: string;
  firstname: string;
  lastname: string;
  resolvedProblems: ResolvedProblem[];
}
