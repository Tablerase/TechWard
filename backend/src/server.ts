import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

// Health route
app.get("/health", (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🚑 Tech Ward backend running at http://localhost:${PORT}`);
});
