import { updateProblemStatus } from "@services/patientService";
import { useCallback, useState } from "react";

export function useResolveProblem(patientId: string, problemId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const resolveProblem = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const updated = await updateProblemStatus(
        patientId,
        problemId,
        "resolved"
      );
      setError(null);
      return updated;
    } catch (err) {
      console.error("Error resolving problem:", err);
      setError(
        new Error(`Failed to resolve problem: ${(err as Error).message}`)
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, [patientId, problemId]);

  return { resolveProblem, loading, error };
}
