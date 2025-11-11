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
      markSessionDisconnected(socket.id);
      socket.to(currentSession.lastRoom).emit(WardEvents.CAREGIVER_LEFT, {
        id: socket.id,
        name: currentSession.caregiverName,
      } as WardEventData.CaregiverLeft);

      // Release all problems assigned to this caregiver
      releaseCaregiversProblems(socket.id);
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
      socket.id,
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
    (data: WardEventData.ResolveProblem) => {
      const currentSession = getSession(socket.id);
      if (!currentSession) return;

      const result = resolveProblem(
        data.patientId,
        data.problemId,
        socket.id,
        currentSession.caregiverName,
      );

      if (result) {
        // Broadcast to all in the room
        socket
          .to(currentSession.lastRoom)
          .emit(WardEvents.PROBLEM_RESOLVED, result);

        // Send updated patients list to all in room
        const wardPatients = getWardPatients();
        socket
          .to(currentSession.lastRoom)
          .emit(WardEvents.WARD_PATIENTS, wardPatients);
        socket.emit(WardEvents.WARD_PATIENTS, wardPatients);
      }
    },
  );

  // Handle problem status update
  socket.on(WardEvents.UPDATE_PROBLEM, (data: WardEventData.UpdateProblem) => {
    const currentSession = getSession(socket.id);
    if (!currentSession) return;

    const result = updateProblemStatusInWard(
      data.patientId,
      data.problemId,
      data.status,
      socket.id,
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
  });
}
