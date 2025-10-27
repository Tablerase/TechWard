import { CorsOptions } from "cors";

// CORS: https://expressjs.com/en/resources/middleware/cors.html

export function getCorsOptions(): CorsOptions {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",").map(o => o.trim()) || [];

  return {
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn(`CORS blocked request from: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  };
}
