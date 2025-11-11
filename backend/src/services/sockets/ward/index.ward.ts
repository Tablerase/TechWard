import { Server } from "socket.io";
import { socketNamespaces } from "../namespaces.socket";
import { registerWardHandlers } from "./handler.ward";
import { WardEvents } from "../../../types/socket.events";
import { AuthService } from "@services/auth/auth.service";

export function initWardNamespace(io: Server) {
  const nsp = io.of(socketNamespaces.WARD);

  // JWT Authentication middleware
  nsp.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    // Verify the token
    const decoded = AuthService.verifyAccessToken(token);

    if (!decoded) {
      return next(new Error("Authentication error: Invalid token"));
    }

    // Get the user from the token
    const user = AuthService.getUserById(decoded.userId);

    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }

    // Store user info in socket data for later use
    socket.data.user = user;

    next();
  });

  nsp.on(WardEvents.CONNECT, (socket) => {
    console.log(`Caregiver connected: ${socket.id}`);
    registerWardHandlers(socket);
  });
}
