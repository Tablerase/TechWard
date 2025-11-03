import { Request, Response } from "express";
import * as caregiversService from "@services/caregivers.service"

export async function getCaregivers(req: Request, res: Response) {
  const caregivers = caregiversService.getCaregivers();
  res.json(caregivers);
}

export async function addCaregiver(req: Request, res: Response) {
  const caregiver = caregiversService.addCaregiver();

  if (!caregiver) {
    return res.status(500).json("Couldnt add a new caregiver");
  }
  res.json(caregiver);
}
