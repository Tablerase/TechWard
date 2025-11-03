import { Request, Response } from "express";
import * as patientsService from "@services/patients.service";
import { Problem } from "@entity/problem";
import { Patient } from "@entity/patient";

export async function getPatients(req: Request, res: Response) {
  const patients = patientsService.getPatients().map((p: Patient) => ({
    ...p,
    overallStatus: patientsService.getPatientHealth(p),
  }));
  res.json(patients);
}

export async function getPatient(req: Request, res: Response) {
  const { id } = req.params;
  if (!id) return res.status(400).json("Missing patient id");
  const patient = patientsService.getPatient(id);
  if (!patient) return res.status(404).json({ error: "Patient not found" });
  res.json(patient);
}

export async function addProblem(req: Request, res: Response) {
  const { id } = req.params;
  if (!id) return res.status(400).json("Missing patient id");

  const { description } = req.body;
  if (!description) return res.status(400).json("Missing description");

  const newProblem = new Problem(id, description);
  const added = patientsService.addProblem(id, newProblem);
  if (!added) return res.status(404).json({ error: "Patient not found" });
  res.json(added);
}

export async function updateProblemStatus(req: Request, res: Response) {
  const { id, problemId } = req.params;
  if (!id) return res.status(400).json("Missing patient id");
  if (!problemId) return res.status(400).json("Missing problem id");

  const { status } = req.body;
  if (!status) return res.status(400).json("Missing status");

  const updated = patientsService.updateProblemStatus(id, problemId, status);
  if (!updated) return res.status(404).json({ error: "Problem not found" });
  res.json(updated);
}

export async function resolveProblem(req: Request, res: Response) {
  const { id, problemId } = req.params;
  if (!id) return res.status(400).json("Missing patient id");
  if (!problemId) return res.status(400).json("Missing problem id");

  try {
    const updated = await patientsService.resolveProblem(id, problemId);
    if (!updated) return res.status(404).json({ error: "Problem not found" });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to resolve problem" });
  }
}
