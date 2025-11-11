import { Request, Response } from "express";
import * as caregiversService from "@services/caregivers.service";
import { randomUUID } from "crypto";

export async function getCaregivers(req: Request, res: Response) {
  const caregivers = caregiversService.getCaregivers();
  res.json(caregivers);
}

export async function addCaregiver(req: Request, res: Response) {
  const { id, firstName, lastName } = req.body;

  // Generate ID if not provided
  const caregiverId = id || randomUUID();

  const caregiver = caregiversService.addCaregiver(
    caregiverId,
    firstName,
    lastName,
  );

  if (!caregiver) {
    return res.status(500).json("Couldn't add a new caregiver");
  }
  res.json(caregiver);
}
