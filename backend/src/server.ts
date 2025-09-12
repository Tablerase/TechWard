import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

// Health route
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Problems route
app.get("/problems", (req, res) => {
  res.json({
    id: 1,
    room: "Patient Room",
    status: "critical",
    problem: "Bandage outdated - Deployment drift detected",
  });
});

app.listen(PORT, () => {
  console.log(`🚑 Tech Ward backend running at http://localhost:${PORT}`);
});
