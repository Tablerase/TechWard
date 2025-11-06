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
} from "@/types/socket.events";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export function useSocket() {
  const [mainSocket, setMainSocket] = useState<Socket | null>(null);
  const [wardSocket, setWardSocket] = useState<WardClientSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [caregiverInfo, setCaregiverInfo] =
    useState<WardCaregiverAssigned | null>(null);
  const [wardPatients, setWardPatients] = useState<WardPatients | null>(null);
  const [lastProblemUpdate, setLastProblemUpdate] = useState<{
    type: "assigned" | "resolved" | "updated";
    data: WardProblemAssigned | WardProblemResolved | WardProblemUpdated;
  } | null>(null);

  useEffect(() => {
    const manager = new Manager(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    const mainSocket = manager.socket("/");

    mainSocket.on("connect", () => {
      console.log("Socket connected to main namespace");
      setIsConnected(true);
    });

    mainSocket.on("disconnect", () => {
      console.log("Socket disconnected from main namespace");
      setIsConnected(false);
    });

    setMainSocket(mainSocket);

    const rawWardSocket = manager.socket("/ward");
    const typedWardSocket = asWardSocket(rawWardSocket);

    typedWardSocket.on(WardEvents.CONNECT, () => {
      console.log("✓ Socket connected to /ward namespace");

      // Request ward patients when connected
      typedWardSocket.emit(WardEvents.GET_WARD_PATIENTS, { room: "default" });
    });

    typedWardSocket.on(WardEvents.DISCONNECT, () => {
      console.log("⏸ Socket disconnected from /ward namespace");
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

    setWardSocket(typedWardSocket);

    return () => {
      typedWardSocket.close();
      mainSocket.close();
    };
  }, []);

  return {
    mainSocket,
    wardSocket,
    isConnected,
    caregiverInfo,
    wardPatients,
    lastProblemUpdate,
  };
}
