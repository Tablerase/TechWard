export type ProblemStatus = "critical" | "resolved";

export class Problem {
  id: number;
  title: string;
  description: string;
  status: ProblemStatus;

  constructor(id: number, title: string, description: string) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.status = "critical";
  }
}
