import express, { json } from "express";
import patient from "./entity/problems";

const app = express();
const PORT = process.env.PORT || 3000;

const demoPatient = patient;

// Health route
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Problems route
app.get("/problems", (req, res) => {
  let resBody = {};
  if (demoPatient.status == "resolved") {
    resBody = {
      id: 1,
      room: "Patient Room",
      status: demoPatient.status,
      problem: "Bandage clean - No Deployment drift detected",
    };
  } else {
    resBody = {
      id: 1,
      room: "Patient Room",
      status: demoPatient.status,
      problem: "Bandage outdated - Deployment drift detected",
    };
  }
  res.json(resBody);
});

// Problems resolution
app.post("/resolve/:id", (req, res) => {
  ((demoPatient.status = "resolved"),
    res.json({ id: 1, status: demoPatient.status }));
});

app.listen(PORT, () => {
  console.log(`🚑 Tech Ward backend running at http://localhost:${PORT}`);
});
