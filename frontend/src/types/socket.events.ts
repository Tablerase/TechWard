/**
 * Socket.IO Event Definitions for Ward Namespace (Frontend)
 *
 * This file mirrors the backend event definitions to provide
 * type safety and autocomplete on the client side.
 *
 * Usage:
 * - Listen: socket.on(WardEvents.CAREGIVER_ASSIGNED, (data) => { ... })
 * - Emit: socket.emit(WardEvents.CHANGE_ROOM, { room: "new-room" })
 */

import { Socket } from "socket.io-client";

/**
 * Event names used in the ward namespace (mirrors backend)
 */
export const WardEvents = {
  // === Client Connect/Disconnect ===
  /** Emitted when a caregiver connects (built-in Socket.IO event) */
  CONNECT: "connect",
  /** Emitted when a caregiver disconnects (built-in Socket.IO event) */
  DISCONNECT: "disconnect",

  // === Server → Client (Listen) ===
  /** Sent to client after connection, includes assigned caregiver name */
  CAREGIVER_ASSIGNED: "caregiver:assigned",
  /** Sent to client after successfully changing rooms */
  ROOM_CHANGED: "ward:roomChanged",

  // === Client → Server (Emit) ===
  /** Client requests to change to a different room */
  CHANGE_ROOM: "ward:changeRoom",

  // === Broadcast Events (listen for other clients in room) ===
  /** Broadcast when a caregiver joins a room */
  CAREGIVER_JOINED: "caregiver:joined",
  /** Broadcast when a caregiver leaves a room */
  CAREGIVER_LEFT: "caregiver:left",

  // === Patient/Problem Events ===
  /** Request patients and their problems for the ward */
  GET_WARD_PATIENTS: "ward:getPatients",
  /** Send ward patients to client */
  WARD_PATIENTS: "ward:patients",
  /** Client assigns a problem to themselves */
  ASSIGN_PROBLEM: "problem:assign",
  /** Broadcast when a problem is assigned (to other caregivers) */
  PROBLEM_ASSIGNED: "problem:assigned",
  /** Client resolves a problem */
  RESOLVE_PROBLEM: "problem:resolve",
  /** Broadcast when a problem is resolved */
  PROBLEM_RESOLVED: "problem:resolved",
  /** Broadcast when a problem starts processing */
  PROBLEM_PROCESSING: "problem:processing",
  /** Client updates problem status */
  UPDATE_PROBLEM: "problem:update",
  /** Broadcast when problem status is updated */
  PROBLEM_UPDATED: "problem:updated",

  // === Caregiver Stats Events ===
  /** Request caregiver statistics */
  GET_CAREGIVER_STATS: "caregiver:getStats",
  /** Send caregiver statistics */
  CAREGIVER_STATS: "caregiver:stats",
} as const;

/**
 * Type definitions for event data payloads (mirrors backend)
 */

/** Sent when caregiver is assigned (on connection) */
export interface WardCaregiverAssigned {
  name: {
    firstName: string;
    lastName: string;
  };
  isNewClient: boolean;
}

/** Sent when caregiver requests room change */
export interface WardChangeRoom {
  room: string;
}

/** Sent when room successfully changed */
export interface WardRoomChanged {
  room: string;
}

/** Sent when caregiver joins a room */
export interface WardCaregiverJoined {
  id: string; // socket.id
  name: {
    firstName: string;
    lastName: string;
  };
}

/** Sent when caregiver leaves a room */
export interface WardCaregiverLeft {
  id: string; // socket.id
  name: {
    firstName: string;
    lastName: string;
  };
}

/** Ward patients data sent to client */
export interface WardPatients {
  patients: {
    id: string;
    name: string;
    problems: {
      id: string;
      description: string;
      status: "critical" | "serious" | "stable" | "resolved" | "processing";
      assignedTo?: {
        caregiverId: string;
        caregiverName: {
          firstName: string;
          lastName: string;
        };
      };
      createdAt: string;
      updatedAt: string;
      isLocked?: boolean;
      lockedUntil?: string;
    }[];
  }[];
}

/** Broadcast when problem is assigned */
export interface WardProblemAssigned {
  patientId: string;
  problemId: string;
  assignedBy: {
    caregiverId: string;
    caregiverName: {
      firstName: string;
      lastName: string;
    };
  };
  timestamp: string;
}

/** Broadcast when problem is resolved */
export interface WardProblemResolved {
  patientId: string;
  problemId: string;
  resolvedBy: {
    caregiverId: string;
    caregiverName: {
      firstName: string;
      lastName: string;
    };
  };
  timestamp: string;
}

/** Broadcast when problem starts processing */
export interface WardProblemProcessing {
  patientId: string;
  problemId: string;
  processingBy: {
    caregiverId: string;
    caregiverName: {
      firstName: string;
      lastName: string;
    };
  };
  timestamp: string;
  message?: string;
}

/** Broadcast when problem status is updated */
export interface WardProblemUpdated {
  patientId: string;
  problemId: string;
  newStatus: "critical" | "serious" | "stable" | "resolved" | "processing";
  updatedBy: {
    caregiverId: string;
    caregiverName: {
      firstName: string;
      lastName: string;
    };
  };
  timestamp: string;
}

/** Request caregiver statistics */
export interface WardGetCaregiverStats {
  caregiverId?: string; // If not provided, use current caregiver
}

/** Caregiver statistics response */
export interface WardCaregiverStats {
  id: string;
  name: {
    firstName: string;
    lastName: string;
  };
  totalResolved: number;
  resolvedProblems: {
    problemId: string;
    patientId: string;
    description: string;
    resolvedAt: string;
  }[];
}

/**
 * Type-safe Socket for ward namespace on frontend
 * Use this for better autocomplete and type checking
 */
export type WardClientSocket = Socket<WardServerEvents, WardClientEmitEvents>;

/**
 * Events the client can listen to from the server
 */
export interface WardServerEvents {
  [WardEvents.CAREGIVER_ASSIGNED]: (data: WardCaregiverAssigned) => void;
  [WardEvents.ROOM_CHANGED]: (data: WardRoomChanged) => void;
  [WardEvents.CAREGIVER_JOINED]: (data: WardCaregiverJoined) => void;
  [WardEvents.CAREGIVER_LEFT]: (data: WardCaregiverLeft) => void;
  [WardEvents.WARD_PATIENTS]: (data: WardPatients) => void;
  [WardEvents.PROBLEM_ASSIGNED]: (data: WardProblemAssigned) => void;
  [WardEvents.PROBLEM_RESOLVED]: (data: WardProblemResolved) => void;
  [WardEvents.PROBLEM_PROCESSING]: (data: WardProblemProcessing) => void;
  [WardEvents.PROBLEM_UPDATED]: (data: WardProblemUpdated) => void;
  [WardEvents.CAREGIVER_STATS]: (data: WardCaregiverStats) => void;
}

/**
 * Events the client can emit to the server
 */
export interface WardClientEmitEvents {
  [WardEvents.CHANGE_ROOM]: (data: WardChangeRoom) => void;
  [WardEvents.GET_WARD_PATIENTS]: (data: { room: string }) => void;
  [WardEvents.ASSIGN_PROBLEM]: (data: {
    patientId: string;
    problemId: string;
  }) => void;
  [WardEvents.RESOLVE_PROBLEM]: (data: {
    patientId: string;
    problemId: string;
  }) => void;
  [WardEvents.UPDATE_PROBLEM]: (data: {
    patientId: string;
    problemId: string;
    status: "critical" | "serious" | "stable" | "resolved" | "processing";
  }) => void;
  [WardEvents.GET_CAREGIVER_STATS]: (data: WardGetCaregiverStats) => void;
}

/**
 * Helper to cast socket to typed version
 */
export function asWardSocket(
  socket: Socket<WardServerEvents, WardClientEmitEvents>
): WardClientSocket {
  return socket as WardClientSocket;
}
