import { createContext, useContext } from "react";
import { Socket } from "socket.io-client";
import {
  WardCaregiverAssigned,
  WardClientSocket,
  WardPatients,
  WardProblemAssigned,
  WardProblemResolved,
  WardProblemUpdated,
} from "@/types/socket.events";

export interface WardSocketContextValue {
  mainSocket: Socket | null;
  wardSocket: WardClientSocket | null;
  isConnected: boolean;
  caregiverInfo: WardCaregiverAssigned | null;
  wardPatients: WardPatients | null;
  lastProblemUpdate: {
    type: "assigned" | "resolved" | "updated";
    data: WardProblemAssigned | WardProblemResolved | WardProblemUpdated;
  } | null;
}

export const WardSocketContext = createContext<
  WardSocketContextValue | undefined
>(undefined);

export function useWardSocket() {
  const context = useContext(WardSocketContext);
  if (context === undefined) {
    throw new Error("useWardSocket must be used within a WardSocketProvider");
  }
  return context;
}
