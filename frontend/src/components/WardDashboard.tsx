/**
 * Example Ward Dashboard Component
 *
 * Shows how to use the socket events to build a real-time ward dashboard
 * where caregivers can see and manage patient problems.
 */

import { useWardSocket } from "@/context/WardSocketContext";
import {
  WardEvents,
  WardProblemAssigned,
  WardProblemResolved,
  WardProblemUpdated,
  WardProblemProcessing,
} from "@/types/socket.events";
import { useState, useEffect } from "react";

export function WardDashboard() {
  const {
    wardSocket,
    wardPatients,
    lastProblemUpdate,
    caregiverInfo,
    caregiverStats,
  } = useWardSocket();
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [statsJustUpdated, setStatsJustUpdated] = useState(false);
  const [previousResolvedCount, setPreviousResolvedCount] = useState<
    number | null
  >(null);

  // Update current time every second for countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Track stats changes and show brief highlight when count increases
  useEffect(() => {
    if (caregiverStats) {
      if (
        previousResolvedCount !== null &&
        caregiverStats.totalResolved > previousResolvedCount
      ) {
        // Stats increased - server sent us updated stats!
        console.log(
          `🎉 Stats updated! You've now resolved ${caregiverStats.totalResolved} problems!`
        );

        // Show visual highlight when stats are received
        setStatsJustUpdated(true);
        const timeout = setTimeout(() => {
          setStatsJustUpdated(false);
        }, 2000); // 2 second highlight

        return () => clearTimeout(timeout);
      }
      setPreviousResolvedCount(caregiverStats.totalResolved);
    }
  }, [caregiverStats, previousResolvedCount]);

  const handleAssignProblem = (patientId: string, problemId: string) => {
    wardSocket?.emit(WardEvents.ASSIGN_PROBLEM, { patientId, problemId });
  };

  const handleResolveProblem = (patientId: string, problemId: string) => {
    wardSocket?.emit(WardEvents.RESOLVE_PROBLEM, { patientId, problemId });
  };

  const handleUpdateStatus = (
    patientId: string,
    problemId: string,
    newStatus: "critical" | "serious" | "stable" | "resolved"
  ) => {
    wardSocket?.emit(WardEvents.UPDATE_PROBLEM, {
      patientId,
      problemId,
      status: newStatus,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-status-critical"; // critical - pink/red
      case "serious":
        return "bg-status-serious"; // serious - orange
      case "stable":
        return "bg-status-stable"; // stable - green
      case "resolved":
        return "bg-status-resolved"; // resolved - darker green
      case "processing":
        return "bg-status-processing"; // processing - blue
      default:
        return "bg-base-bg"; // base-muted
    }
  };

  // Calculate time remaining for locked problems
  const getTimeRemaining = (lockedUntil: string) => {
    const lockEnd = new Date(lockedUntil);
    const diff = lockEnd.getTime() - currentTime;

    if (diff <= 0) return null;

    const min_in_ms = 60000;
    const minutes = Math.floor(diff / min_in_ms);
    const seconds = Math.floor((diff % min_in_ms) / 1000);

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Check if a problem is actually locked (not expired)
  const isActuallyLocked = (problem: {
    isLocked?: boolean;
    lockedUntil?: string;
  }) => {
    if (!problem.isLocked || !problem.lockedUntil) return false;
    const lockEnd = new Date(problem.lockedUntil);
    return currentTime < lockEnd.getTime();
  };

  if (!wardPatients) {
    return <div>Loading ward data...</div>;
  }

  return (
    <div className="p-6">
      {/* Header with Caregiver Info */}
      <div className="mb-6 bg-base-muted p-4 rounded border border-base-border">
        <h1 className="text-2xl font-bold mb-2 text-base-text">
          🏥 Ward Dashboard
        </h1>
        {caregiverInfo && (
          <p className="text-base-text-muted">
            👤 Welcome, {caregiverInfo.name.firstName}{" "}
            {caregiverInfo.name.lastName}
            {caregiverInfo.isNewClient && " - First time here! 🎉"}
          </p>
        )}
      </div>
      {/* Latest Update Notification */}
      {lastProblemUpdate && (
        <div
          className={`mb-6 border rounded p-4 ${
            lastProblemUpdate.type === "processing"
              ? "bg-primary-light border-primary"
              : "bg-primary-light/10 border-primary"
          }`}
        >
          {lastProblemUpdate.type === "assigned" && (
            <p className="text-base-text">
              📌{" "}
              <strong>
                {
                  (lastProblemUpdate.data as WardProblemAssigned).assignedBy
                    .caregiverName.firstName
                }
              </strong>{" "}
              assigned problem {lastProblemUpdate.data.problemId}
            </p>
          )}
          {lastProblemUpdate.type === "resolved" && (
            <p className="text-secondary-dark">
              ✅{" "}
              <strong>
                {
                  (lastProblemUpdate.data as WardProblemResolved).resolvedBy
                    .caregiverName.firstName
                }
              </strong>{" "}
              resolved problem {lastProblemUpdate.data.problemId}
            </p>
          )}
          {lastProblemUpdate.type === "updated" && (
            <p className="text-tertiary-dark">
              🔄{" "}
              <strong>
                {
                  (lastProblemUpdate.data as WardProblemUpdated).updatedBy
                    .caregiverName.firstName
                }
              </strong>{" "}
              updated problem {lastProblemUpdate.data.problemId} to{" "}
              <em>
                {(lastProblemUpdate.data as WardProblemUpdated).newStatus}
              </em>
            </p>
          )}
          {lastProblemUpdate.type === "processing" && (
            <p className="text-base-text flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-primary-dark"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>
                <strong>
                  {
                    (lastProblemUpdate.data as WardProblemProcessing)
                      .processingBy.caregiverName.firstName
                  }
                </strong>{" "}
                is working on problem {lastProblemUpdate.data.problemId}:{" "}
                <em>
                  {(lastProblemUpdate.data as WardProblemProcessing).message}
                </em>
              </span>
            </p>
          )}
        </div>
      )}

      {/* Patients and Problems Grid */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {wardPatients.patients.map((patient) => (
          <div
            key={patient.id}
            className="border rounded-lg overflow-hidden shadow-md border-base-border"
          >
            {/* Patient Header */}
            <div className="bg-base-muted p-4 border-b border-base-border">
              <h2 className="text-xl font-bold text-base-text">
                {patient.name}
              </h2>
              <p className="text-base-text-muted text-sm">
                {patient.problems.length} problem(s)
              </p>
            </div>

            {/* Problems List */}
            <div className="p-4 space-y-4">
              {patient.problems.length === 0 ? (
                <p className="text-base-text-muted italic">No problems</p>
              ) : (
                patient.problems.map((problem) => {
                  const locked = isActuallyLocked(problem);
                  return (
                    <div
                      key={problem.id}
                      className={`p-3 rounded border-l-4 ${getStatusColor(
                        problem.status
                      )} bg-base-muted ${locked ? "opacity-75 relative" : ""}`}
                    >
                      {/* Lock Overlay */}
                      {locked && problem.lockedUntil && (
                        <div className="absolute top-2 right-2 bg-status-critical text-base-text px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {getTimeRemaining(problem.lockedUntil) || "Locked"}
                        </div>
                      )}

                      {/* Problem Description */}
                      <p className="font-semibold text-base-text">
                        {problem.description}
                      </p>

                      {/* Status & Assignment Info */}
                      <div className="mt-2 text-sm text-base-text-muted">
                        <p>
                          Status:{" "}
                          <span className="font-bold capitalize">
                            {problem.status}
                          </span>
                          {problem.status === "processing" && (
                            <span className="ml-2 inline-flex items-center">
                              <svg
                                className="animate-spin h-4 w-4 text-primary-dark"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                            </span>
                          )}
                        </p>
                        {problem.assignedTo ? (
                          <p>
                            Assigned to:{" "}
                            <span className="font-bold">
                              {problem.assignedTo.caregiverName.firstName}{" "}
                              {problem.assignedTo.caregiverName.lastName}
                            </span>
                          </p>
                        ) : (
                          <p className="italic text-base-text-muted opacity-60">
                            Unassigned
                          </p>
                        )}
                        <p className="text-xs text-base-text-muted opacity-75 mt-1">
                          Updated:{" "}
                          {new Date(problem.updatedAt).toLocaleTimeString()}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-3 flex gap-2 flex-wrap">
                        {/* Assign Button */}
                        {!problem.assignedTo && (
                          <button
                            onClick={() =>
                              handleAssignProblem(patient.id, problem.id)
                            }
                            disabled={locked || problem.status === "processing"}
                            className={`px-3 py-1 text-base-text text-sm rounded ${
                              locked || problem.status === "processing"
                                ? "bg-base-muted opacity-50 cursor-not-allowed"
                                : "bg-primary hover:bg-primary-dark"
                            }`}
                            title={locked ? "Problem is locked" : undefined}
                          >
                            Assign to Me
                          </button>
                        )}

                        {/* Status Change Dropdown */}
                        <select
                          value={problem.status}
                          onChange={(e) =>
                            handleUpdateStatus(
                              patient.id,
                              problem.id,
                              e.target.value as
                                | "critical"
                                | "serious"
                                | "stable"
                                | "resolved"
                            )
                          }
                          disabled={locked || problem.status === "processing"}
                          className={`px-2 py-1 border border-base-border rounded text-sm bg-base-bg text-base-text ${
                            locked || problem.status === "processing"
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          title={locked ? "Problem is locked" : undefined}
                        >
                          <option value="critical">Critical</option>
                          <option value="serious">Serious</option>
                          <option value="stable">Stable</option>
                          <option value="resolved">Resolved</option>
                          {problem.status === "processing" && (
                            <option value="processing">Processing</option>
                          )}
                        </select>

                        {/* Resolve Button (only if assigned) */}
                        {problem.assignedTo && (
                          <button
                            onClick={() =>
                              handleResolveProblem(patient.id, problem.id)
                            }
                            disabled={locked || problem.status === "processing"}
                            className={`px-3 py-1 text-base-text text-sm rounded ${
                              locked || problem.status === "processing"
                                ? "bg-base-muted opacity-50 cursor-not-allowed"
                                : "bg-secondary hover:bg-secondary-dark"
                            }`}
                            title={locked ? "Problem is locked" : undefined}
                          >
                            {problem.status === "processing"
                              ? "Processing..."
                              : "Resolve"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Caregiver Stats Panel */}
      {caregiverStats ? (
        <div
          className={`mb-6 bg-secondary-light border border-secondary rounded-lg p-4 transition-all duration-300 ${
            statsJustUpdated
              ? "ring-4 ring-secondary shadow-lg scale-[1.02]"
              : ""
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-base-text flex items-center gap-2">
              📊 Your Performance
              {statsJustUpdated && (
                <span className="text-sm font-normal text-secondary-dark animate-pulse">
                  ✨ Updated!
                </span>
              )}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Total Resolved */}
            <div
              className={`bg-base-bg rounded p-4 shadow-sm border border-base-border transition-all duration-300 ${
                statsJustUpdated
                  ? "bg-secondary-light ring-2 ring-secondary"
                  : ""
              }`}
            >
              <div className="text-3xl font-bold text-secondary-dark">
                {caregiverStats.totalResolved}
              </div>
              <div className="text-base-text-muted text-sm mt-1">
                Total Problems Resolved
              </div>
            </div>

            {/* Recent Resolutions */}
            <div className="bg-base-bg rounded p-4 shadow-sm border border-base-border">
              <div className="font-semibold text-base-text mb-2">
                Recent Resolutions
              </div>
              {caregiverStats.resolvedProblems.length === 0 ? (
                <p className="text-base-text-muted text-sm italic">
                  No problems resolved yet
                </p>
              ) : (
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {caregiverStats.resolvedProblems
                    .slice(-3)
                    .reverse()
                    .map((resolved, index) => (
                      <div
                        key={`${resolved.problemId}-${index}`}
                        className="text-sm text-base-text-muted"
                      >
                        ✓ {resolved.description.substring(0, 40)}
                        {resolved.description.length > 40 && "..."}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Expandable Details */}
          {caregiverStats.resolvedProblems.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setShowStatsModal(true)}
                className="text-secondary-dark hover:text-secondary text-sm font-semibold underline"
              >
                View All {caregiverStats.totalResolved} Resolved Problems →
              </button>
            </div>
          )}
        </div>
      ) : (
        caregiverInfo && (
          <div className="mb-6 bg-base-muted border border-base-border rounded-lg p-4">
            <div className="text-base-text-muted text-sm">
              Loading your performance stats...
            </div>
          </div>
        )
      )}

      {/* Stats Modal */}
      {showStatsModal && caregiverStats && (
        <div
          className="fixed inset-0 bg-base-text/50 flex items-center justify-center z-50"
          onClick={() => setShowStatsModal(false)}
        >
          <div
            className="bg-base-bg rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto border border-base-border shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-base-text">
                📊 All Resolved Problems
              </h2>
              <button
                onClick={() => setShowStatsModal(false)}
                className="text-base-text-muted hover:text-base-text text-2xl"
              >
                ×
              </button>
            </div>

            <div className="mb-4 text-base-text-muted">
              Total: <strong>{caregiverStats.totalResolved}</strong> problems
              resolved
            </div>

            <div className="space-y-3">
              {caregiverStats.resolvedProblems.map((resolved, index) => (
                <div
                  key={`${resolved.problemId}-${index}`}
                  className="border border-base-border rounded p-3 hover:bg-base-muted"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-base-text">
                        {resolved.description}
                      </div>
                      <div className="text-sm text-base-text-muted mt-1">
                        Patient ID: {resolved.patientId}
                      </div>
                    </div>
                    <div className="text-xs text-base-text-muted ml-4 whitespace-nowrap">
                      {new Date(resolved.resolvedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {wardPatients.patients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-2xl text-base-text-muted">
            😌 No patients in the ward
          </p>
        </div>
      )}
    </div>
  );
}

export default WardDashboard;
