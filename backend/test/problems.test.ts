import { describe, it, expect } from "@jest/globals";
import { Problem } from "@entity/problem";

describe("Problem Entity", () => {
  it("should create a Problem instance", () => {
    const problem = new Problem("p1", "Test description");
    expect(problem).toBeInstanceOf(Problem);
    expect(problem.id).toBe("p1");
    expect(problem.description).toBe("Test description");
  });

  it("should check if problem is available", () => {
    const problem = new Problem("p1", "Test");
    expect(problem.isAvailable()).toBe(true);
  });

  it("should resolve a problem", () => {
    const problem = new Problem("p1", "Test");
    problem.resolve();
    expect(problem.status).toBe("resolved");
    expect(problem.assignedCaregiver).toBeUndefined();
  });
});
