import { funnyCaregiverNameGenerator } from "@utils/funnyCaregiverNames";

interface ClientSession {
  socketId: string;
  ip: string;
  caregiverName: {
    firstName: string;
    lastName: string;
  };
  lastRoom: string;
  connectedAt: number;
  lastDisconnectAt?: number;
}

// Store active sessions by socketId
const activeSessions = new Map<string, ClientSession>();

// Store inactive sessions by IP for rejoin detection
const inactiveSessions = new Map<string, ClientSession>();

const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds
const DEFAULT_ROOM = "default";

/**
 * Create a new session for a client or restore from inactive
 * Returns session and whether it's a new client (first time joining)
 */
export function createOrRestoreSession(
  socketId: string,
  ip: string,
): { session: ClientSession; isNewClient: boolean } {
  // Check if client has a recent inactive session
  const inactiveSession = inactiveSessions.get(ip);
  const now = Date.now();

  if (
    inactiveSession &&
    inactiveSession.lastDisconnectAt &&
    now - inactiveSession.lastDisconnectAt < SESSION_TIMEOUT
  ) {
    // Restore previous session
    const restoredSession: ClientSession = {
      ...inactiveSession,
      socketId, // Update with new socket ID
      connectedAt: now,
    };
    delete (restoredSession as Partial<ClientSession>).lastDisconnectAt;

    activeSessions.set(socketId, restoredSession);
    inactiveSessions.delete(ip);

    console.log(
      `[Session] Client ${ip} rejoined as ${restoredSession.caregiverName.firstName} ${restoredSession.caregiverName.lastName}`,
    );

    return { session: restoredSession, isNewClient: false };
  }

  // Create new session for first-time or expired client
  const newSession: ClientSession = {
    socketId,
    ip,
    caregiverName: funnyCaregiverNameGenerator(),
    lastRoom: DEFAULT_ROOM,
    connectedAt: now,
  };

  activeSessions.set(socketId, newSession);

  console.log(
    `[Session] New client ${ip} assigned caregiver name: ${newSession.caregiverName.firstName} ${newSession.caregiverName.lastName}`,
  );

  return { session: newSession, isNewClient: true };
}

/**
 * Get active session by socket ID
 */
export function getSession(socketId: string): ClientSession | undefined {
  return activeSessions.get(socketId);
}

/**
 * Update the last room a client was in
 */
export function updateSessionRoom(socketId: string, room: string): void {
  const session = activeSessions.get(socketId);
  if (session) {
    session.lastRoom = room;
  }
}

/**
 * Mark session as disconnected and move to inactive
 */
export function markSessionDisconnected(socketId: string): void {
  const session = activeSessions.get(socketId);
  if (session) {
    session.lastDisconnectAt = Date.now();
    inactiveSessions.set(session.ip, session);
    activeSessions.delete(socketId);

    console.log(
      `[Session] Client ${session.ip} (${session.caregiverName.firstName} ${session.caregiverName.lastName}) disconnected - will be available for rejoin for 1 hour`,
    );
  }
}

/**
 * Clean up expired sessions (older than SESSION_TIMEOUT)
 */
export function cleanupExpiredSessions(): void {
  const now = Date.now();
  let cleanedCount = 0;

  for (const [ip, session] of inactiveSessions.entries()) {
    if (
      session.lastDisconnectAt &&
      now - session.lastDisconnectAt >= SESSION_TIMEOUT
    ) {
      inactiveSessions.delete(ip);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    console.log(`[Session] 🗑 Cleaned up ${cleanedCount} expired session(s)`);
  }
}

/**
 * Get all active sessions (for debugging/monitoring)
 */
export function getAllActiveSessions(): ClientSession[] {
  return Array.from(activeSessions.values());
}

/**
 * Get all inactive sessions (for debugging/monitoring)
 */
export function getAllInactiveSessions(): ClientSession[] {
  return Array.from(inactiveSessions.values());
}
