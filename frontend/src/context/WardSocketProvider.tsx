import { useEffect, useState } from "react";
import { Manager, Socket } from "socket.io-client";
import {
  WardEvents,
  WardCaregiverAssigned,
  WardClientSocket,
  asWardSocket,
  WardPatients,
  WardProblemAssigned,
  WardProblemResolved,
  WardProblemUpdated,
  WardCaregiverStats,
  WardProblemProcessing,
} from "@/types/socket.events";
import { WardSocketContext } from "./WardSocketContext";
import { useAuth } from "./AuthContext";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export function WardSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { accessToken, isAuthenticated } = useAuth();
  const [mainSocket, setMainSocket] = useState<Socket | null>(null);
  const [wardSocket, setWardSocket] = useState<WardClientSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [caregiverInfo, setCaregiverInfo] =
    useState<WardCaregiverAssigned | null>(null);
  const [wardPatients, setWardPatients] = useState<WardPatients | null>(null);
  const [lastProblemUpdate, setLastProblemUpdate] = useState<{
    type: "assigned" | "resolved" | "updated" | "processing";
    data:
      | WardProblemAssigned
      | WardProblemResolved
      | WardProblemUpdated
      | WardProblemProcessing;
  } | null>(null);
  const [caregiverStats, setCaregiverStats] =
    useState<WardCaregiverStats | null>(null);

  useEffect(() => {
    // Only connect if authenticated and have access token
    if (!isAuthenticated || !accessToken) {
      console.warn("Not authenticated, skipping socket connection");
      return;
    }

    console.log("Initializing socket connection...");

    const manager = new Manager(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    const mainSocketInstance = manager.socket("/");

    mainSocketInstance.on("connect", () => {
      console.log("Socket connected to main namespace");
      setIsConnected(true);
    });

    mainSocketInstance.on("disconnect", () => {
      console.log("Socket disconnected from main namespace");
      setIsConnected(false);
    });

    setMainSocket(mainSocketInstance);

    // Connect to /ward namespace with JWT authentication
    const rawWardSocket = manager.socket("/ward", {
      auth: {
        token: accessToken,
      },
    });
    const typedWardSocket = asWardSocket(rawWardSocket);

    typedWardSocket.on(WardEvents.CONNECT, () => {
      console.log("✓ Socket connected to /ward namespace");

      // Request ward patients when connected
      typedWardSocket.emit(WardEvents.GET_WARD_PATIENTS, { room: "default" });
    });

    typedWardSocket.on(WardEvents.DISCONNECT, () => {
      console.log("⏸ Socket disconnected from /ward namespace");
    });

    // Listen for authentication errors
    typedWardSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
      if (error.message.includes("Authentication error")) {
        console.error("JWT authentication failed. Please login again.");
      }
    });

    typedWardSocket.on(
      WardEvents.CAREGIVER_ASSIGNED,
      (data: WardCaregiverAssigned) => {
        console.log(
          `🧑‍⚕️ Assigned caregiver: ${data.name.firstName} ${data.name.lastName}`
        );
        if (data.isNewClient) {
          console.log("🎉 Welcome as a new caregiver!");
        } else {
          console.log("✓ Welcome back!");
        }
        setCaregiverInfo(data);
        setIsConnected(true);

        // Request caregiver stats after assignment
        typedWardSocket.emit(WardEvents.GET_CAREGIVER_STATS, {});
      }
    );

    // Listen for ward patients data
    typedWardSocket.on(WardEvents.WARD_PATIENTS, (data: WardPatients) => {
      console.log(
        `📋 Received ward patients: ${data.patients.length} patient(s)`
      );
      setWardPatients(data);
    });

    // Listen for problem assignments
    typedWardSocket.on(
      WardEvents.PROBLEM_ASSIGNED,
      (data: WardProblemAssigned) => {
        console.log(
          `📌 Problem ${data.problemId} assigned to ${data.assignedBy.caregiverName.firstName}`
        );
        setLastProblemUpdate({ type: "assigned", data });
        // Request updated patients list
        typedWardSocket.emit(WardEvents.GET_WARD_PATIENTS, { room: "default" });
      }
    );

    // Listen for problem resolutions
    typedWardSocket.on(
      WardEvents.PROBLEM_RESOLVED,
      (data: WardProblemResolved) => {
        console.log(
          `✅ Problem ${data.problemId} resolved by ${data.resolvedBy.caregiverName.firstName}`
        );
        setLastProblemUpdate({ type: "resolved", data });
        // Request updated patients list
        typedWardSocket.emit(WardEvents.GET_WARD_PATIENTS, { room: "default" });
        // Note: Stats will be automatically sent by server to the resolver
      }
    );

    // Listen for problem status updates
    typedWardSocket.on(
      WardEvents.PROBLEM_UPDATED,
      (data: WardProblemUpdated) => {
        console.log(
          `🔄 Problem ${data.problemId} updated to ${data.newStatus} by ${data.updatedBy.caregiverName.firstName}`
        );
        setLastProblemUpdate({ type: "updated", data });
        // Request updated patients list
        typedWardSocket.emit(WardEvents.GET_WARD_PATIENTS, { room: "default" });
      }
    );

    // Listen for problem processing updates
    typedWardSocket.on(
      WardEvents.PROBLEM_PROCESSING,
      (data: WardProblemProcessing) => {
        console.log(`⏳ Problem ${data.problemId} processing: ${data.message}`);
        setLastProblemUpdate({ type: "processing", data });
        // Request updated patients list to show processing status
        typedWardSocket.emit(WardEvents.GET_WARD_PATIENTS, { room: "default" });
      }
    );

    // Listen for caregiver stats
    typedWardSocket.on(
      WardEvents.CAREGIVER_STATS,
      (data: WardCaregiverStats) => {
        console.log(
          `📊 Received stats for ${data.name.firstName}: ${data.totalResolved} problems resolved`
        );
        setCaregiverStats(data);
      }
    );

    setWardSocket(typedWardSocket);

    // Cleanup function - disconnect sockets when component unmounts or auth changes
    return () => {
      console.log("Cleaning up socket connections...");
      typedWardSocket.close();
      mainSocketInstance.close();
    };
  }, [accessToken, isAuthenticated]); // Reconnect when auth changes

  return (
    <WardSocketContext.Provider
      value={{
        mainSocket,
        wardSocket,
        isConnected,
        caregiverInfo,
        wardPatients,
        lastProblemUpdate,
        caregiverStats,
      }}
    >
      {children}
    </WardSocketContext.Provider>
  );
}
