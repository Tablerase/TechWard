import { Router } from "express";
import {
  getPatients,
  addProblem,
  updateProblemStatus,
  getPatientHealth,
  getPatient,
} from "@models/patients";

const router = Router();

router.get("/", (req, res) => {
  const patients = getPatients().map((p) => ({
    ...p,
    overallStatus: getPatientHealth(p),
  }));
  res.json(patients);
});

router.get("/:id/", (req, res) => {
  const { id } = req.params;
  const patient = getPatient(id);
  if (!patient) return res.status(404).json({ error: "Patient not found" });
  res.json(patient);
});

router.post("/:id/problems", (req, res) => {
  const { id } = req.params;
  const { description } = req.body;
  const newProblem = {
    id: Date.now().toString(),
    description,
    status: "serious" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const added = addProblem(id, newProblem);
  if (!added) return res.status(404).json({ error: "Patient not found" });
  res.json(added);
});

router.patch("/:id/problems/:problemId", (req, res) => {
  const { id, problemId } = req.params;
  const { status } = req.body;
  const updated = updateProblemStatus(id, problemId, status);
  if (!updated) return res.status(404).json({ error: "Problem not found" });
  res.json(updated);
});

export default router;
