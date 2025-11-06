import { getCorsOptions } from "@utils/corsOptions";
import { Server } from "socket.io";
import { cleanupExpiredSessions } from "@services/clientSession.service";
import { initWardNamespace } from "./ward/index.ward";

let globalIO: Server;

export function initGlobalIO(httpServer: any) {
  const io = new Server(httpServer, {
    cors: getCorsOptions(),
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });

    // Example: Listen for problem updates from frontend
    socket.on("problem:update", (data) => {
      console.log("Problem update received:", data);
      // Broadcast to all connected clients
      io.emit("problem:updated", data);
    });
  });

  initWardNamespace(io);

  // Clean up expired sessions every 10 minutes
  setInterval(
    () => {
      cleanupExpiredSessions();
    },
    10 * 60 * 1000,
  );

  return io;
}

export function setGlobalIO(io: Server) {
  globalIO = io;
}

export function getGlobalIO() {
  return globalIO;
}
