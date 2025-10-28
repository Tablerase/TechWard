import express from "express";
import { config } from "dotenv";
import cors from "cors";
import { getCorsOptions } from "@utils/corsOptions";
import routes from "@routes/index";
import { updateDeployment } from "@utils/argocdDemo/updateDeployment";

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

app.post("/update-app", async (req, res) => {
  const { tag } = req.body as { tag?: string };

  if (!tag) {
    return res.status(400).json({ error: "Missing 'tag' in request body" });
  }

  try {
    await updateDeployment(tag);
    res.json({ status: "success", message: `Updated image to ${tag}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", error: (err as Error).message });
  }
});

app.listen(PORT, () => {
  console.log(
    `🚑 Tech Ward backend running at http://localhost:${PORT} in ${process.env.NODE_ENV} mode`,
  );
});
