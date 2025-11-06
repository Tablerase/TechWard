import { Server } from "socket.io";
import { socketNamespaces } from "../namespaces.socket";
import { registerWardHandlers } from "./handler.ward";
import { WardEvents } from "../../../types/socket.events";

export function initWardNamespace(io: Server) {
  const nsp = io.of(socketNamespaces.WARD);

  nsp.use((socket, next) => {
    // optional middleware
    // ...
    next();
  });

  nsp.on(WardEvents.CONNECT, (socket) => {
    console.log(`Caregiver connected: ${socket.id}`);
    registerWardHandlers(socket);
  });
}
