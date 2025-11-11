/**
 * Socket.IO Event Definitions for Ward Namespace
 *
 * This file defines all events that can be emitted and listened to
 * in the /ward namespace. It serves as the single source of truth
 * for socket events, ensuring type safety and autocomplete across
 * the backend.
 *
 * Usage:
 * - Emit: socket.emit(WardEvents.CAREGIVER_ASSIGNED, data)
 * - Listen: socket.on(WardEvents.CAREGIVER_ASSIGNED, (data) => { ... })
 */

import { Socket } from "socket.io";

/**
 * Event names used in the ward namespace
 */
export const WardEvents = {
  // === Client Connect/Disconnect ===
  /** Emitted when a caregiver connects (built-in Socket.IO event) */
  CONNECT: "connect",
  /** Emitted when a caregiver disconnects (built-in Socket.IO event) */
  DISCONNECT: "disconnect",

  // === Server → Client (Emit) ===
  /** Sent to client after connection, includes assigned caregiver name */
  CAREGIVER_ASSIGNED: "caregiver:assigned",
  /** Sent to client after successfully changing rooms */
  ROOM_CHANGED: "ward:roomChanged",

  // === Client → Server (On) ===
  /** Client requests to change to a different room */
  CHANGE_ROOM: "ward:changeRoom",

  // === Broadcast Events (to other clients in room) ===
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
} as const;

/**
 * Type definitions for event data payloads
 */
export namespace WardEventData {
  /** Sent when caregiver is assigned (on connection) */
  export interface CaregiverAssigned {
    name: {
      firstName: string;
      lastName: string;
    };
    isNewClient: boolean;
  }

  /** Sent when caregiver requests room change */
  export interface ChangeRoom {
    room: string;
  }

  /** Sent when room successfully changed */
  export interface RoomChanged {
    room: string;
  }

  /** Sent when caregiver joins a room */
  export interface CaregiverJoined {
    id: string; // socket.id
    name: {
      firstName: string;
      lastName: string;
    };
  }

  /** Sent when caregiver leaves a room */
  export interface CaregiverLeft {
    id: string; // socket.id
    name: {
      firstName: string;
      lastName: string;
    };
  }

  /** Request to get ward patients */
  export interface GetWardPatients {
    room: string;
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

  /** Client assigns a problem to themselves */
  export interface AssignProblem {
    patientId: string;
    problemId: string;
  }

  /** Broadcast when problem is assigned */
  export interface ProblemAssigned {
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

  /** Client resolves a problem */
  export interface ResolveProblem {
    patientId: string;
    problemId: string;
  }

  /** Broadcast when problem is resolved */
  export interface ProblemResolved {
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
  export interface ProblemProcessing {
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

  /** Client updates problem status */
  export interface UpdateProblem {
    patientId: string;
    problemId: string;
    status: "critical" | "serious" | "stable" | "resolved" | "processing";
  }

  /** Broadcast when problem status is updated */
  export interface ProblemUpdated {
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
}

/**
 * Events the server can emit to the client
 */
export interface WardServerEvents {
  [WardEvents.CAREGIVER_ASSIGNED]: (
    data: WardEventData.CaregiverAssigned,
  ) => void;
  [WardEvents.ROOM_CHANGED]: (data: WardEventData.RoomChanged) => void;
  [WardEvents.CAREGIVER_JOINED]: (data: WardEventData.CaregiverJoined) => void;
  [WardEvents.CAREGIVER_LEFT]: (data: WardEventData.CaregiverLeft) => void;
  [WardEvents.WARD_PATIENTS]: (data: WardEventData.WardPatients) => void;
  [WardEvents.PROBLEM_ASSIGNED]: (data: WardEventData.ProblemAssigned) => void;
  [WardEvents.PROBLEM_RESOLVED]: (data: WardEventData.ProblemResolved) => void;
  [WardEvents.PROBLEM_PROCESSING]: (
    data: WardEventData.ProblemProcessing,
  ) => void;
  [WardEvents.PROBLEM_UPDATED]: (data: WardEventData.ProblemUpdated) => void;
}

/**
 * Events the server can listen to from the client
 */
export interface WardClientEvents {
  [WardEvents.CHANGE_ROOM]: (data: WardEventData.ChangeRoom) => void;
  [WardEvents.GET_WARD_PATIENTS]: (data: WardEventData.GetWardPatients) => void;
  [WardEvents.ASSIGN_PROBLEM]: (data: WardEventData.AssignProblem) => void;
  [WardEvents.RESOLVE_PROBLEM]: (data: WardEventData.ResolveProblem) => void;
  [WardEvents.UPDATE_PROBLEM]: (data: WardEventData.UpdateProblem) => void;
}

/**
 * Type-safe Socket for ward namespace on backend
 * Use this for better autocomplete and type checking
 */
export type WardSocket = Socket<WardClientEvents, WardServerEvents>;
