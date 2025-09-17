import { Problem } from "@entity/problem";

export interface Patient {
  id: string;
  name: string;
  problems: Problem[];
}
