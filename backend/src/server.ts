import express from "express";
import { config } from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { getCorsOptions } from "@utils/corsOptions";
import routes from "@routes/index.routes";
import { initGlobalIO, setGlobalIO } from "@services/sockets/index.socket";
import { createServer } from "http";

// Config
config(); // Loads env var
const PORT = process.env.PORT || 3000;

console.log(
  `CORS allowed origins: ${process.env.ALLOWED_ORIGINS || "not set"}`,
);

// ! currently websocket ip id cause problem
// TODO: replace session auth with ip by a generated token (no login needed) stored within client
// TODO: do session generation during websocket handshake or by a simple auth route.
// TODO: implement problem class to resolve problem currently websockets use an interface

// Express
const app = express();

// Socket
const httpServer = createServer(app);
const io = initGlobalIO(httpServer);
setGlobalIO(io);

// Express config
app.use(cors(getCorsOptions()));
app.use(cookieParser());
app.use(express.json());

// Health route
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// All routes
app.use("/", routes);

httpServer.listen(PORT, () => {
  console.log(
    `🚑 Tech Ward backend running at http://localhost:${PORT} in ${process.env.NODE_ENV} mode`,
  );
});
