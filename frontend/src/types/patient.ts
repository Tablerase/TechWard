import { Problem } from "./problem";

export interface Patient {
  id: string;
  name: string;
  problems: Problem[];
}
