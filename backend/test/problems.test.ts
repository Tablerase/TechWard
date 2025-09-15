import { describe, it, expect } from "@jest/globals";
import { Problem } from "@entity/problems";

describe("Problem Entity", () => {
  it("should create a Problem instance", () => {
    const problem = new Problem("Test", "Test description");
    expect(problem).toBeInstanceOf(Problem);
    expect(problem.title).toBe("Test");
    expect(problem.description).toBe("Test description");
  });
});
