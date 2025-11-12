import {
  WardSocket,
  WardEvents,
  WardEventData,
} from "../../../types/socket.events";
import {
  createOrRestoreSession,
  getSession,
  updateSessionRoom,
  markSessionDisconnected,
} from "@services/clientSession.service";
import {
  getWardPatients,
  assignProblem,
  resolveProblem,
  updateProblemStatusInWard,
  releaseCaregiversProblems,
} from "@services/wardPatient.service";
import * as caregiversService from "@services/caregivers.service";

export function registerWardHandlers(socket: WardSocket) {
  // Get authenticated user from socket data (set by middleware)
  const user = socket.data.user;

  if (!user) {
    console.error(`[WARD] No authenticated user found for socket ${socket.id}`);
    socket.disconnect();
    return;
  }

  console.log(`[WARD] Processing connection for user: ${user.id}`);

  // Create or restore session when client connects to ward namespace
  const { session, isNewClient } = createOrRestoreSession(socket.id, user);

  console.log(
    `[WARD] Session created: ${session.caregiverName.firstName} ${session.caregiverName.lastName} (new: ${isNewClient})`,
  );

  // Store session info on socket for later use
  (socket.data as any).session = session;
  (socket.data as any).isNewClient = isNewClient;

  // Emit caregiver info to client
  socket.emit(WardEvents.CAREGIVER_ASSIGNED, {
    name: session.caregiverName,
    isNewClient,
  } as WardEventData.CaregiverAssigned);

  // Join the room (for now always default room)
  socket.join(session.lastRoom);

  // Broadcast to all clients in the room that a caregiver joined
  socket.to(session.lastRoom).emit(WardEvents.CAREGIVER_JOINED, {
    id: socket.id,
    name: session.caregiverName,
  } as WardEventData.CaregiverJoined);

  // Handle room change if client requests it
  socket.on(WardEvents.CHANGE_ROOM, (data: WardEventData.ChangeRoom) => {
    const { room } = data;
    const currentSession = getSession(socket.id);

    if (currentSession) {
      // Leave old room
      socket.leave(currentSession.lastRoom);
      socket.to(currentSession.lastRoom).emit(WardEvents.CAREGIVER_LEFT, {
        id: socket.id,
        name: currentSession.caregiverName,
      } as WardEventData.CaregiverLeft);

      // Join new room
      socket.join(room);
      updateSessionRoom(socket.id, room);

      socket.to(room).emit(WardEvents.CAREGIVER_JOINED, {
        id: socket.id,
        name: currentSession.caregiverName,
      } as WardEventData.CaregiverJoined);

      socket.emit(WardEvents.ROOM_CHANGED, {
        room,
      } as WardEventData.RoomChanged);
    }
  });

  // Handle disconnect
  socket.on(WardEvents.DISCONNECT, () => {
    const currentSession = getSession(socket.id);
    if (currentSession) {
      // Release all problems assigned to this caregiver
      releaseCaregiversProblems(currentSession.caregiverId);

      // Broadcast to all clients in the room that caregiver left
      socket.to(currentSession.lastRoom).emit(WardEvents.CAREGIVER_LEFT, {
        id: socket.id,
        name: currentSession.caregiverName,
      } as WardEventData.CaregiverLeft);

      // Send updated patients list to all remaining clients in the room
      // This ensures they see that problems are no longer assigned
      const wardPatients = getWardPatients();
      socket
        .to(currentSession.lastRoom)
        .emit(WardEvents.WARD_PATIENTS, wardPatients);

      // Mark session as disconnected
      markSessionDisconnected(socket.id);

      console.log(
        `[WARD] Caregiver ${currentSession.caregiverName.firstName} ${currentSession.caregiverName.lastName} disconnected and all assignments released`,
      );
    }
  });

  // Handle getting ward patients
  socket.on(
    WardEvents.GET_WARD_PATIENTS,
    (data: WardEventData.GetWardPatients) => {
      const wardPatients = getWardPatients();
      socket.emit(WardEvents.WARD_PATIENTS, wardPatients);
    },
  );

  // Handle problem assignment
  socket.on(WardEvents.ASSIGN_PROBLEM, (data: WardEventData.AssignProblem) => {
    const currentSession = getSession(socket.id);
    if (!currentSession) return;

    const result = assignProblem(
      data.patientId,
      data.problemId,
      currentSession.caregiverId,
      currentSession.caregiverName,
    );

    if (result) {
      // Broadcast to all in the room
      socket
        .to(currentSession.lastRoom)
        .emit(WardEvents.PROBLEM_ASSIGNED, result);

      // Send updated patients list to all in room
      const wardPatients = getWardPatients();
      socket
        .to(currentSession.lastRoom)
        .emit(WardEvents.WARD_PATIENTS, wardPatients);
      socket.emit(WardEvents.WARD_PATIENTS, wardPatients);
    }
  });

  // Handle problem resolution
  socket.on(
    WardEvents.RESOLVE_PROBLEM,
    async (data: WardEventData.ResolveProblem) => {
      const currentSession = getSession(socket.id);
      if (!currentSession) return;

      // First, emit processing state immediately
      const processingEvent: WardEventData.ProblemProcessing = {
        patientId: data.patientId,
        problemId: data.problemId,
        processingBy: {
          caregiverId: currentSession.caregiverId,
          caregiverName: currentSession.caregiverName,
        },
        timestamp: new Date().toISOString(),
        message: "Starting problem resolution...",
      };

      // Broadcast processing state to all in room (including sender)
      socket
        .to(currentSession.lastRoom)
        .emit(WardEvents.PROBLEM_PROCESSING, processingEvent);
      socket.emit(WardEvents.PROBLEM_PROCESSING, processingEvent);

      // Send updated patients list showing processing status
      let wardPatients = getWardPatients();
      socket
        .to(currentSession.lastRoom)
        .emit(WardEvents.WARD_PATIENTS, wardPatients);
      socket.emit(WardEvents.WARD_PATIENTS, wardPatients);

      // Helper function to send processing updates
      const sendProcessingUpdate = (message: string) => {
        const updateEvent: WardEventData.ProblemProcessing = {
          patientId: data.patientId,
          problemId: data.problemId,
          processingBy: {
            caregiverId: currentSession.caregiverId,
            caregiverName: currentSession.caregiverName,
          },
          timestamp: new Date().toISOString(),
          message,
        };
        socket
          .to(currentSession.lastRoom)
          .emit(WardEvents.PROBLEM_PROCESSING, updateEvent);
        socket.emit(WardEvents.PROBLEM_PROCESSING, updateEvent);
      };

      try {
        sendProcessingUpdate("Analyzing problem...");

        // Resolve the problem (async for special problems like ArgoProblem)
        const result = await resolveProblem(
          data.patientId,
          data.problemId,
          currentSession.caregiverId,
          currentSession.caregiverName,
        );

        if (result) {
          // Broadcast resolution success to all in the room (including sender)
          socket
            .to(currentSession.lastRoom)
            .emit(WardEvents.PROBLEM_RESOLVED, result);
          socket.emit(WardEvents.PROBLEM_RESOLVED, result);

          // Send updated patients list to all in room
          wardPatients = getWardPatients();
          socket
            .to(currentSession.lastRoom)
            .emit(WardEvents.WARD_PATIENTS, wardPatients);
          socket.emit(WardEvents.WARD_PATIENTS, wardPatients);

          // Send updated stats to the caregiver who resolved the problem
          const stats = caregiversService.getCaregiverStats(
            currentSession.caregiverId,
          );
          if (stats) {
            socket.emit(WardEvents.CAREGIVER_STATS, stats);
            console.log(
              `[WARD] Sent updated stats to ${currentSession.caregiverName.firstName} (${stats.totalResolved} total)`,
            );
          }
        }
      } catch (error) {
        console.error("[WARD] Problem resolution failed:", error);

        sendProcessingUpdate(
          `Resolution failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        );

        // Send updated patients list (problem status may have reverted)
        wardPatients = getWardPatients();
        socket
          .to(currentSession.lastRoom)
          .emit(WardEvents.WARD_PATIENTS, wardPatients);
        socket.emit(WardEvents.WARD_PATIENTS, wardPatients);

        // Optionally emit an error event (you could add this to socket events)
        socket.emit(WardEvents.PROBLEM_UPDATED, {
          patientId: data.patientId,
          problemId: data.problemId,
          newStatus: "serious",
          updatedBy: {
            caregiverId: currentSession.caregiverId,
            caregiverName: currentSession.caregiverName,
          },
          timestamp: new Date().toISOString(),
        });
      }
    },
  );

  // Handle problem status update
  socket.on(WardEvents.UPDATE_PROBLEM, (data: WardEventData.UpdateProblem) => {
    const currentSession = getSession(socket.id);
    if (!currentSession) return;

    try {
      const result = updateProblemStatusInWard(
        data.patientId,
        data.problemId,
        data.status,
        currentSession.caregiverId,
        currentSession.caregiverName,
      );

      if (result) {
        // Broadcast to all in the room
        socket
          .to(currentSession.lastRoom)
          .emit(WardEvents.PROBLEM_UPDATED, result);

        // Send updated patients list to all in room
        const wardPatients = getWardPatients();
        socket
          .to(currentSession.lastRoom)
          .emit(WardEvents.WARD_PATIENTS, wardPatients);
        socket.emit(WardEvents.WARD_PATIENTS, wardPatients);
      }
    } catch (error) {
      console.error("[WARD] Problem status update failed:", error);

      // Send error message to client (could add a specific error event)
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update problem status";
      console.log(`[WARD] Sending error to client: ${errorMessage}`);

      // Send current state back to client
      const wardPatients = getWardPatients();
      socket.emit(WardEvents.WARD_PATIENTS, wardPatients);
    }
  });

  // Handle caregiver stats request
  socket.on(
    WardEvents.GET_CAREGIVER_STATS,
    (data: WardEventData.GetCaregiverStats) => {
      const currentSession = getSession(socket.id);
      if (!currentSession) return;

      // Use provided caregiverId or current caregiver's ID
      const caregiverId = data.caregiverId || currentSession.caregiverId;
      const stats = caregiversService.getCaregiverStats(caregiverId);

      if (stats) {
        socket.emit(WardEvents.CAREGIVER_STATS, stats);
      } else {
        console.error(`[WARD] Stats not found for caregiver ${caregiverId}`);
      }
    },
  );
}
