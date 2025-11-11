/**
 * Example Ward Dashboard Component
 *
 * Shows how to use the socket events to build a real-time ward dashboard
 * where caregivers can see and manage patient problems.
 */

import { useSocket } from "@/hooks/useSocket";
import {
  WardEvents,
  WardProblemAssigned,
  WardProblemResolved,
  WardProblemUpdated,
} from "@/types/socket.events";

export function WardDashboard() {
  const { wardSocket, wardPatients, lastProblemUpdate, caregiverInfo } =
    useSocket();

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
        return "bg-red-500";
      case "serious":
        return "bg-orange-500";
      case "stable":
        return "bg-yellow-500";
      case "resolved":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  if (!wardPatients) {
    return <div>Loading ward data...</div>;
  }

  return (
    <div className="p-6">
      {/* Header with Caregiver Info */}
      <div className="mb-6 bg-blue-50 p-4 rounded">
        <h1 className="text-2xl font-bold">🏥 Ward Dashboard</h1>
        {caregiverInfo && (
          <p className="text-gray-600">
            👤 Welcome, {caregiverInfo.name.firstName}{" "}
            {caregiverInfo.name.lastName}
            {caregiverInfo.isNewClient && " - First time here! 🎉"}
          </p>
        )}
      </div>

      {/* Latest Update Notification */}
      {lastProblemUpdate && (
        <div className="mb-6 bg-blue-100 border border-blue-400 rounded p-4">
          {lastProblemUpdate.type === "assigned" && (
            <p className="text-blue-800">
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
            <p className="text-green-800">
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
            <p className="text-yellow-800">
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
        </div>
      )}

      {/* Patients and Problems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {wardPatients.patients.map((patient) => (
          <div
            key={patient.id}
            className="border rounded-lg overflow-hidden shadow-md"
          >
            {/* Patient Header */}
            <div className="bg-blue-100 p-4 border-b">
              <h2 className="text-xl font-bold">{patient.name}</h2>
              <p className="text-gray-600 text-sm">
                {patient.problems.length} problem(s)
              </p>
            </div>

            {/* Problems List */}
            <div className="p-4 space-y-4">
              {patient.problems.length === 0 ? (
                <p className="text-gray-500 italic">No problems</p>
              ) : (
                patient.problems.map((problem) => (
                  <div
                    key={problem.id}
                    className={`p-3 rounded border-l-4 ${getStatusColor(
                      problem.status
                    )} bg-gray-50`}
                  >
                    {/* Problem Description */}
                    <p className="font-semibold text-gray-800">
                      {problem.description}
                    </p>

                    {/* Status & Assignment Info */}
                    <div className="mt-2 text-sm text-gray-600">
                      <p>
                        Status:{" "}
                        <span className="font-bold capitalize">
                          {problem.status}
                        </span>
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
                        <p className="italic text-gray-400">Unassigned</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
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
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
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
                        className="px-2 py-1 border rounded text-sm"
                      >
                        <option value="critical">Critical</option>
                        <option value="serious">Serious</option>
                        <option value="stable">Stable</option>
                        <option value="resolved">Resolved</option>
                      </select>

                      {/* Resolve Button (only if assigned) */}
                      {problem.assignedTo && (
                        <button
                          onClick={() =>
                            handleResolveProblem(patient.id, problem.id)
                          }
                          className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {wardPatients.patients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-2xl text-gray-400">😌 No patients in the ward</p>
        </div>
      )}
    </div>
  );
}

export default WardDashboard;
