import express from "express";
import { config } from "dotenv";
import cors from "cors";
import { getCorsOptions } from "@utils/corsOptions";
import routes from "@routes/index.routes";

// Config
config(); // Loads env var
const PORT = process.env.PORT || 3000;

console.log(`CORS allowed origins: ${process.env.ALLOWED_ORIGINS || "not set"}`);

// Express
const app = express();
app.use(cors(getCorsOptions()));
app.use(express.json());

// Health route
app.get("/health", (req, res) => {
  res.json({ status: "ok" })
});

// All routes
app.use("/", routes);


app.listen(PORT, () => {
  console.log(
    `🚑 Tech Ward backend running at http://localhost:${PORT} in ${process.env.NODE_ENV} mode`,
  );
});
