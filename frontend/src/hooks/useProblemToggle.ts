import { useCallback, useEffect, useState } from "react";
import { updateProblemStatus } from "@services/patientService";
import { ProblemStatus } from "@/types";

interface UseProblemToggleArgs {
  patientId: string;
  problemId: string;
  initialStatus?: ProblemStatus;
}

export function useProblemToggle({
  patientId,
  problemId,
  initialStatus = "critical",
}: UseProblemToggleArgs) {
  const [status, setStatus] = useState<ProblemStatus>(initialStatus);
  const [loading, setLoading] = useState(false);

  // keep local status in sync with latest fetched data
  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus, problemId]);

  const toggleStatus = useCallback(async () => {
    if (!patientId || !problemId) return;
    const next = status === "critical" ? "resolved" : "critical";
    setLoading(true);
    try {
      const updated = await updateProblemStatus(patientId, problemId, next);
      setStatus(updated.status);
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setLoading(false);
    }
  }, [patientId, problemId, status]);

  return { status, loading, toggleStatus };
}
