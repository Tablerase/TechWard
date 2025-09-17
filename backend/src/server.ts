import express from "express";
import { config } from "dotenv";
import cors from "cors";
import { getCorsOptions } from "@utils/corsOptions";
import { Problem } from "@entity/problems";

// Config
config(); // Loads env var

// Express
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors(getCorsOptions()));

let demoProblem = new Problem(
  1,
  "Patient Bandage",
  "Bandage clean - No Deployment drift detected",
);

// Health route
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Problems route
app.get("/problems", (req, res) => {
  let resBody = {};
  resBody = { demoProblem };
  res.json(resBody);
});

// Problems resolution
app.post("/resolve/:id", (req, res) => {
  demoProblem.status = "resolved";

  res.json({ demoProblem });
});

app.listen(PORT, () => {
  console.log(
    `🚑 Tech Ward backend running at http://localhost:${PORT} in ${process.env.NODE_ENV} mode`,
  );
});
