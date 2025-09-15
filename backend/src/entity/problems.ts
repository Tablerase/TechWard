export type PatientStatus = "critical" | "resolved";

export interface Patient {
  status: PatientStatus;
}

export const patient: Patient = {
  status: "critical",
};

export default patient;

export class Problem {
  title: string;
  description: string;
  constructor(title: string, description: string) {
    this.title = title;
    this.description = description;
  }
}
